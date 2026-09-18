import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    @classmethod
    def validate(cls):
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing from environment variables.")
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is missing from environment variables.")

Settings.validate()
settings = Settings()
