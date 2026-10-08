from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.prompts import DRAFTER_SYSTEM_PROMPT
from app.rag.vectorstore import get_retriever
from app.core.schemas import DrafterResponse

class SupportDrafter:
    def __init__(self):
        self.llm = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.2
        ).with_structured_output(DrafterResponse)
        self.retriever = get_retriever()

    async def draft_response(self, ticket_text: str, customer_name: str = "Valued Customer") -> Dict[str, Any]:
        """Retrieves context and generates a drafted response and sentiment classification."""
        docs = await self.retriever.ainvoke(ticket_text)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        human_prompt = (
            f"Customer Name: {customer_name}\n"
            f"Customer Ticket:\n{ticket_text}\n\n"
            f"Relevant Company Policies:\n{context}\n\n"
            "Please draft the response. Ensure you greet the customer by their Name."
        )
        
        messages = [
            SystemMessage(content=DRAFTER_SYSTEM_PROMPT),
            HumanMessage(content=human_prompt)
        ]
        
        try:
            result = await self.llm.ainvoke(messages)
            return {
                "draft": result.draft_response,
                "sentiment": result.sentiment,
                "context_used": context
            }
        except Exception as e:
            return {
                "draft": f"System Error: Failed to generate draft. Details: {str(e)}",
                "sentiment": "neutral",
                "context_used": context
            }
