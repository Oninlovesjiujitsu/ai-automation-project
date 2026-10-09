from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any
import json
import httpx
import os
from app.agents.drafter import SupportDrafter
from app.evaluators.gatekeeper import Gatekeeper

router = APIRouter(prefix="/api", tags=["Support Engine"])

class TicketRequest(BaseModel):
    ticket_text: str
    customer_name: str = "Valued Customer"

# Instantiate services once to follow Singleton/Dependency Injection patterns loosely
drafter_service = SupportDrafter()
gatekeeper_service = Gatekeeper()

@router.post("/process-ticket")
async def process_ticket(req: TicketRequest) -> Dict[str, Any]:
    """
    Orchestrates the entire support flow:
    1. Drafts a response using the Support Agent
    2. Evaluates the draft using the Gatekeeper
    3. Returns the final payload
    """
    draft_result = await drafter_service.draft_response(req.ticket_text, req.customer_name)
    
    # If drafting failed systemically, don't evaluate
    if "System Error" in draft_result["draft"]:
        return {
            "draft": draft_result["draft"],
            "sentiment": draft_result["sentiment"],
            "evaluation": {"score": 0.0, "passed": False, "reason": "Drafting failed"}
        }

    eval_result = await gatekeeper_service.evaluate(
        ticket=req.ticket_text,
        draft=draft_result["draft"],
        context=draft_result["context_used"]
    )
    
    return {
        "draft": draft_result["draft"],
        "sentiment": draft_result["sentiment"],
        "evaluation": eval_result
    }

@router.post("/stream-ticket")
async def stream_ticket(req: TicketRequest):
    """
    Streaming orchestration:
    1. Yields real-time events from the Support Agent (logs and text chunks).
    2. Runs the Gatekeeper evaluation asynchronously at the end and yields the result.
    """
    async def event_generator():
        internal_data = {}
        
        # 1. Stream the draft response
        async for chunk_str in drafter_service.stream_draft_response(req.ticket_text, req.customer_name):
            try:
                data = json.loads(chunk_str)
                # Catch internal complete signal to run evaluation
                if data.get("type") == "internal_complete":
                    internal_data = data
                    continue
            except:
                pass
            
            # SSE format: "data: {json}\n\n"
            yield f"data: {chunk_str}\n\n"
            
        # 2. Evaluate the draft using the Gatekeeper
        if internal_data.get("full_draft") and not "System Error" in internal_data.get("full_draft"):
            yield f"data: {json.dumps({'type': 'log', 'content': 'Running DeepEval validation...'})}\n\n"
            
            eval_result = await gatekeeper_service.evaluate(
                ticket=req.ticket_text,
                draft=internal_data["full_draft"],
                context=internal_data["context_used"]
            )
            
            yield f"data: {json.dumps({'type': 'eval', 'data': eval_result})}\n\n"
            
            if not eval_result.get("passed"):
                webhook_url = os.getenv("N8N_ESCALATE_URL", "http://n8n:5678/webhook/escalate")
                try:
                    async with httpx.AsyncClient() as client:
                        await client.post(webhook_url, json={
                            "ticket_text": req.ticket_text,
                            "draft": internal_data["full_draft"],
                            "evaluation": eval_result
                        })
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'log', 'content': f'Failed to trigger Slack escalation webhook: {e}'})}\n\n"
        
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/refresh-db")
def refresh_db() -> Dict[str, Any]:
    """Manually triggers a refresh of the vector database."""
    from app.rag.vectorstore import refresh_vectorstore, get_retriever
    refresh_vectorstore()
    drafter_service.retriever = get_retriever()
    return {"status": "success", "message": "Vector database refreshed"}
