from typing import Dict, Any
from deepeval.models.base_model import DeepEvalBaseLLM
from langchain_groq import ChatGroq
from deepeval.metrics import HallucinationMetric, AnswerRelevancyMetric
from deepeval.test_case import LLMTestCase

class GroqDeepEval(DeepEvalBaseLLM):
    """Custom wrapper to allow DeepEval to use ChatGroq (Llama-3-70B)."""
    def __init__(self):
        # Using the powerful 120B model for strict reasoning and evaluation
        self.model = ChatGroq(model="openai/gpt-oss-120b", temperature=0.0)

    def load_model(self):
        return self.model

    def generate(self, prompt: str) -> str:
        res = self.model.invoke(prompt)
        return res.content

    async def a_generate(self, prompt: str) -> str:
        res = await self.model.ainvoke(prompt)
        return res.content

    def get_model_name(self):
        return "openai/gpt-oss-120b"


class Gatekeeper:
    def __init__(self):
        self.eval_model = GroqDeepEval()

    async def evaluate(self, ticket: str, draft: str, context: str) -> Dict[str, Any]:
        """Evaluates a drafted response against the retrieved context for hallucinations and relevancy."""
        # Threshold 0.5 means any substantial failure fails the check
        hallucination_metric = HallucinationMetric(threshold=0.5, model=self.eval_model)
        relevancy_metric = AnswerRelevancyMetric(threshold=0.5, model=self.eval_model)
        
        test_case = LLMTestCase(
            input=ticket,
            actual_output=draft,
            context=[context],
            retrieval_context=[context]
        )
        
        try:
            await hallucination_metric.a_measure(test_case)
            await relevancy_metric.a_measure(test_case)
            
            passed = hallucination_metric.is_successful() and relevancy_metric.is_successful()
            score = (hallucination_metric.score + relevancy_metric.score) / 2
            reason = f"Hallucination: {hallucination_metric.reason} | Relevancy: {relevancy_metric.reason}"
            
            return {
                "score": score,
                "passed": passed,
                "reason": reason
            }
        except Exception as e:
            return {
                "score": 0.0,
                "passed": False,
                "reason": f"Evaluation System Error: {str(e)}"
            }
