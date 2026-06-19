import json
import os
import re

from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv

from prompts.resume_prompt import SYSTEM_PROMPT

load_dotenv()

_client = OpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1"
)
_model = os.environ.get("MODEL_NAME", "meta-llama/llama-2-70b-chat")


def analyze_resume(resume_text: str) -> dict:
    """
    Send resume text to OpenRouter and return parsed JSON analysis.
    Raises HTTP 500 on OpenRouter failure or unparseable response.
    """
    try:
        response = _client.chat.completions.create(
            model=_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": resume_text},
            ],
            temperature=0.2,
            max_tokens=2048,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"OpenRouter API call failed: {exc}",
        )

    raw_text: str = response.choices[0].message.content or ""
    return _parse_llm_json(raw_text)


def _parse_llm_json(raw: str) -> dict:
    """
    Defensively extract JSON from LLM output.

    LLMs frequently produce one of these patterns even when told not to:
      1. Raw JSON (ideal)
      2. ```json ... ``` (markdown code fence with language tag)
      3. ``` ... ```     (plain markdown code fence)
      4. JSON with leading/trailing prose

    Strategy: strip fences first, then locate the outermost { } block.
    """
    # Clean up markdown fences
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()

    # Find JSON object boundaries
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter returned a response that does not contain valid JSON.",
        )

    json_str = cleaned[start : end + 1]

    try:
        # First attempt: direct parsing
        result = json.loads(json_str)
    except json.JSONDecodeError:
        # Second attempt: aggressively clean problematic characters
        try:
            # Remove all control characters except newline and tab
            json_str_cleaned = "".join(
                char for char in json_str
                if ord(char) >= 32 or char in '\n\t\r'
            )
            # Try parsing again
            result = json.loads(json_str_cleaned)
        except json.JSONDecodeError:
            # Third attempt: escape problematic strings
            try:
                # Remove characters with ASCII < 32 (control chars)
                json_str_cleaned = re.sub(r'[\x00-\x1f]', '', json_str)
                result = json.loads(json_str_cleaned)
            except json.JSONDecodeError as exc:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse JSON from OpenRouter response: {exc}",
                )

    required = {"overall_score", "ats_score", "strengths", "weaknesses",
                "action_items", "summary"}
    missing = required - result.keys()
    if missing:
        raise HTTPException(
            status_code=500,
            detail=f"OpenRouter response missing required fields: {missing}",
        )

    return result
