from pydantic import BaseModel, Field
from typing import Literal

class DrafterResponse(BaseModel):
    sentiment: Literal["happy", "neutral", "frustrated", "angry"] = Field(
        description="The emotional tone of the customer ticket."
    )
    draft_response: str = Field(
        description="The drafted polite response based strictly on company policies."
    )
