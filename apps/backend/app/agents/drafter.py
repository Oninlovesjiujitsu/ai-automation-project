import json
from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.prompts import DRAFTER_SYSTEM_PROMPT
from app.rag.vectorstore import get_retriever

class SupportDrafter:
    def __init__(self):
        self.llm = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.2,
            # Force JSON mode for structured output
            model_kwargs={"response_format": {"type": "json_object"}}
        )
        self.retriever = get_retriever()

    def draft_response(self, ticket_text: str) -> Dict[str, Any]:
        """Retrieves context and generates a drafted response and sentiment classification."""
        docs = self.retriever.invoke(ticket_text)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        human_prompt = (
            f"Customer Ticket:\n{ticket_text}\n\n"
            f"Relevant Company Policies:\n{context}\n\n"
            "Please draft the response and determine sentiment in JSON format."
        )
        
        messages = [
            SystemMessage(content=DRAFTER_SYSTEM_PROMPT),
            HumanMessage(content=human_prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            result = json.loads(response.content)
            return {
                "draft": result.get("draft_response", ""),
                "sentiment": result.get("sentiment", "neutral"),
                "context_used": context
            }
        except Exception as e:
            return {
                "draft": f"System Error: Failed to generate draft. Details: {str(e)}",
                "sentiment": "neutral",
                "context_used": context
            }
