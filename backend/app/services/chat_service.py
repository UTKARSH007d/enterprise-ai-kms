from dotenv import load_dotenv
import os

from google import genai
from google.genai import errors

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=api_key
)


def generate_ai_response(
    question: str,
    retrieved_chunks: list[str],
    conversation_history: list[str]
):

    # No relevant information retrieved
    if not retrieved_chunks:
        return "I couldn't find this information in the uploaded documents."

    # Combine retrieved chunks
    context = "\n\n".join(retrieved_chunks)

    # Convert conversation history into readable text
    history = "\n".join(conversation_history)

    prompt = f"""
You are an AI assistant for ABC Technologies.

Answer the user's question naturally and professionally using ONLY
the information contained in the provided context.

IMPORTANT RULES:

1. Do not use outside knowledge.
2. Do not invent or assume information.
3. If the answer cannot be found in the context, reply exactly:

"I couldn't find this information in the uploaded documents."

4. Answer the question directly.
5. Do not mention phrases such as:
   - "Based on the provided context"
   - "According to the context"
6. Use the conversation history only to understand references
   from previous questions.

Conversation History:
{history}

Context:
{context}

Question:
{question}

Answer:
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        return response.text

    except errors.ClientError as e:

        # Gemini quota/rate limit
        if getattr(e, "code", None) == 429:

            print("Gemini API quota exceeded:", e)

            return (
                "The AI service has temporarily reached its usage limit. "
                "Please try again later."
            )

        print("Gemini API error:", e)

        return (
            "The AI service is temporarily unavailable. "
            "Please try again later."
        )

    except Exception as e:

        print("Unexpected AI error:", e)

        return (
            "The AI assistant is temporarily unavailable. "
            "Please try again later."
        )