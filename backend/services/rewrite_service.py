import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

_client = OpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1"
)
_model = os.environ.get("MODEL_NAME", "meta-llama/llama-2-70b-chat")


def rewrite_resume(original_text: str, action_items: list[str]) -> str:
    """
    Rewrite resume incorporating action items and best practices.
    """
    action_items_text = "\n".join(f"- {item}" for item in action_items)

    prompt = f"""You are a professional resume writer. Given the original resume text and improvement suggestions,
rewrite the resume as a polished, ATS-optimized document. Preserve all facts and dates.
Incorporate the following improvements:

{action_items_text}

Original Resume:
{original_text}

Return ONLY the rewritten resume text with no commentary or explanation."""

    response = _client.chat.completions.create(
        model=_model,
        messages=[
            {"role": "system", "content": "You are an expert resume writer. Return only the rewritten resume text."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2048,
    )

    return response.choices[0].message.content or ""
