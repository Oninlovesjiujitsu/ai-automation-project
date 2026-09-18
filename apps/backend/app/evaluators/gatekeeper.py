from typing import Dict, Any
from deepeval.models.base_model import DeepEvalBaseLLM
from langchain_groq import ChatGroq
from deepeval.metrics import HallucinationMetric
from deepeval.test_case import LLMTestCase

class GroqDeepEval(DeepEvalBaseLLM):
    """Custom wrapper to allow DeepEval to use ChatGroq (Llama-3-70B)."""
    def __init__(self):
        # Using the powerful 70B model for strict reasoning and evaluation
        self.model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.0)

    def load_model(self):
        return self.model

    def generate(self, prompt: str) -> str:
        res = self.model.invoke(prompt)
        return res.content

    async def a_generate(self, prompt: str) -> str:
        res = await self.model.ainvoke(prompt)
        return res.content

    def get_model_name(self):
        return "llama-3.3-70b-versatile"


class Gatekeeper:
    def __init__(self):
        self.eval_model = GroqDeepEval()

    def evaluate(self, ticket: str, draft: str, context: str) -> Dict[str, Any]:
        """Evaluates a drafted response against the retrieved context for hallucinations."""
        # Threshold 0.5 means any substantial hallucination fails the check
        metric = HallucinationMetric(threshold=0.5, model=self.eval_model)
        
        test_case = LLMTestCase(
            input=ticket,
            actual_output=draft,
            context=[context]
        )
        
        try:
            metric.measure(test_case)
            return {
                "score": metric.score,
                "passed": metric.is_successful(),
                "reason": metric.reason
            }
        except Exception as e:
            return {
                "score": 0.0,
                "passed": False,
                "reason": f"Evaluation System Error: {str(e)}"
            }
