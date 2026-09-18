from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.agents.drafter import SupportDrafter
from app.evaluators.gatekeeper import Gatekeeper

router = APIRouter(prefix="/api", tags=["Support Engine"])

class TicketRequest(BaseModel):
    ticket_text: str

# Instantiate services once to follow Singleton/Dependency Injection patterns loosely
drafter_service = SupportDrafter()
gatekeeper_service = Gatekeeper()

@router.post("/process-ticket")
def process_ticket(req: TicketRequest) -> Dict[str, Any]:
    """
    Orchestrates the entire support flow:
    1. Drafts a response using the Support Agent
    2. Evaluates the draft using the Gatekeeper
    3. Returns the final payload
    """
    draft_result = drafter_service.draft_response(req.ticket_text)
    
    # If drafting failed systemically, don't evaluate
    if "System Error" in draft_result["draft"]:
        return {
            "draft": draft_result["draft"],
            "sentiment": draft_result["sentiment"],
            "evaluation": {"score": 0.0, "passed": False, "reason": "Drafting failed"}
        }

    eval_result = gatekeeper_service.evaluate(
        ticket=req.ticket_text,
        draft=draft_result["draft"],
        context=draft_result["context_used"]
    )
    
    return {
        "draft": draft_result["draft"],
        "sentiment": draft_result["sentiment"],
        "evaluation": eval_result
    }
