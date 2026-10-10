from typing import Dict, Any, AsyncGenerator
import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.prompts import DRAFTER_SYSTEM_PROMPT
from app.rag.vectorstore import get_retriever
from app.core.schemas import DrafterResponse
from pydantic import BaseModel, Field
from typing import Literal

class SentimentResponse(BaseModel):
    sentiment: Literal["happy", "neutral", "frustrated", "angry"] = Field(
        description="The emotional tone of the customer ticket."
    )

class SupportDrafter:
    def __init__(self):
        # Structured LLM for legacy draft_response
        self.llm_structured = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.2
        ).with_structured_output(DrafterResponse)
        
        # Structured LLM for sentiment only
        self.llm_sentiment = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.1
        ).with_structured_output(SentimentResponse)
        
        # Plain LLM for streaming
        self.llm_stream = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0.2,
            streaming=True
        )
        self.retriever = get_retriever()

    async def draft_response(self, ticket_text: str, customer_name: str = "Valued Customer") -> Dict[str, Any]:
        """Retrieves context and generates a drafted response and sentiment classification."""
        docs = await self.retriever.ainvoke(ticket_text)
        context = "\n\n".join([doc.page_content for doc in docs])
        
        human_prompt = (
            f"<customer_name>\n{customer_name}\n</customer_name>\n\n"
            f"<customer_ticket>\n{ticket_text}\n</customer_ticket>\n\n"
            f"<company_policies>\n{context}\n</company_policies>\n\n"
            "<instructions>\n"
            "Draft the response based on the above ticket and policies. Greet the customer by their name.\n"
            "</instructions>"
        )
        
        messages = [
            SystemMessage(content=DRAFTER_SYSTEM_PROMPT),
            HumanMessage(content=human_prompt)
        ]
        
        try:
            result = await self.llm_structured.ainvoke(messages)
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

    async def stream_draft_response(self, ticket_text: str, customer_name: str = "Valued Customer") -> AsyncGenerator[str, None]:
        """Asynchronous generator that yields SSE-formatted JSON strings."""
        try:
            yield json.dumps({"type": "log", "content": "Querying vector database for relevant policies..."})
            docs = await self.retriever.ainvoke(ticket_text)
            context = "\n\n".join([doc.page_content for doc in docs])
            yield json.dumps({"type": "log", "content": f"Retrieved {len(docs)} policy documents."})
            
            yield json.dumps({"type": "log", "content": "Analyzing customer sentiment..."})
            
            # Analyze sentiment quickly
            sentiment_msg = [
                SystemMessage(content="""<role>
You are an expert customer support intent analyzer.
</role>

<instructions>
Classify the customer's sentiment.
- Treat factual reporting of issues (e.g., 'forgot password', 'link expired') as 'neutral'.
- Reserve 'frustrated' or 'angry' classifications strictly for tickets expressing explicit negative emotion or aggressive language.
</instructions>"""),
                HumanMessage(content=f"<customer_ticket>\n{ticket_text}\n</customer_ticket>")
            ]
            sentiment_result = await self.llm_sentiment.ainvoke(sentiment_msg)
            sentiment = sentiment_result.sentiment
            yield json.dumps({"type": "sentiment", "content": sentiment})
            
            yield json.dumps({"type": "log", "content": f"Drafting response with tone: {sentiment}..."})
            
            human_prompt = (
                f"<customer_name>\n{customer_name}\n</customer_name>\n\n"
                f"<customer_ticket>\n{ticket_text}\n</customer_ticket>\n\n"
                f"<company_policies>\n{context}\n</company_policies>\n\n"
                "<instructions>\n"
                "Draft the response based on the above ticket and policies. Greet the customer by their name.\n"
                "</instructions>"
            )
            messages = [
                SystemMessage(content=DRAFTER_SYSTEM_PROMPT),
                HumanMessage(content=human_prompt)
            ]
            
            # Keep track of full draft for the evaluator later
            full_draft = ""
            async for chunk in self.llm_stream.astream(messages):
                if chunk.content:
                    full_draft += chunk.content
                    yield json.dumps({"type": "chunk", "content": chunk.content})
            
            yield json.dumps({"type": "log", "content": "Draft complete."})
            
            # Yield a final hidden event that passes the raw data to the router for evaluation
            yield json.dumps({"type": "internal_complete", "full_draft": full_draft, "context_used": context, "sentiment": sentiment})
            
        except Exception as e:
            yield json.dumps({"type": "log", "content": f"System Error: {str(e)}"})
