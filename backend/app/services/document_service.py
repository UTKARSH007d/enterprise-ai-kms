from dotenv import load_dotenv
import os
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key
)


def summarize_document(document_text: str) -> str:

    if not document_text:
        return "No document text is available for summarization."

    prompt = f"""
You are an AI assistant for ABC Technologies.

Summarize the following enterprise document clearly and concisely.

Focus on:
- Main purpose
- Important policies or rules
- Key numbers, dates, and requirements
- Important employee actions or responsibilities

Do not add information that is not present in the document.

Document:
{document_text}

Summary:
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text