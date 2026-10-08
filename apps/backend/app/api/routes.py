from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
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

@router.post("/refresh-db")
def refresh_db() -> Dict[str, Any]:
    """Manually triggers a refresh of the vector database."""
    from app.rag.vectorstore import refresh_vectorstore, get_retriever
    refresh_vectorstore()
    drafter_service.retriever = get_retriever()
    return {"status": "success", "message": "Vector database refreshed"}
