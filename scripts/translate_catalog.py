#!/usr/bin/env python3
"""Generate offline UI translation JSON from src/i18n/en.json."""
import concurrent.futures
import json
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/i18n/en.json"
OUTPUT = ROOT / "src/i18n/locales.json"
CACHE = ROOT / "src/i18n/.translation-cache"
LANGUAGES = {
    "hi": ("Hindi", "हिन्दी", "hi-IN"),
    "bn": ("Bengali", "বাংলা", "bn-IN"),
    "te": ("Telugu", "తెలుగు", "te-IN"),
    "mr": ("Marathi", "मराठी", "mr-IN"),
    "ta": ("Tamil", "தமிழ்", "ta-IN"),
    "gu": ("Gujarati", "ગુજરાતી", "gu-IN"),
    "ur": ("Urdu", "اردو", "ur-IN"),
    "kn": ("Kannada", "ಕನ್ನಡ", "kn-IN"),
    "ml": ("Malayalam", "മലയാളം", "ml-IN"),
    "pa": ("Punjabi", "ਪੰਜਾਬੀ", "pa-IN"),
    "or": ("Odia", "ଓଡ଼ିଆ", "or-IN"),
    "as": ("Assamese", "অসমীয়া", "as-IN"),
}


def main():
    english = json.loads(SOURCE.read_text(encoding="utf-8"))
    schema = {
        "type": "object",
        "properties": {key: {"type": "string"} for key in english},
        "required": list(english),
        "additionalProperties": False,
    }
    client = OpenAI()

    def translate(item):
        code, (language, native_name, _voice) = item
        cached_file = CACHE / f"{code}.json"
        cached = {}
        if cached_file.is_file():
            cached = json.loads(cached_file.read_text(encoding="utf-8"))
        remaining = {key: value for key, value in english.items() if key not in cached}
        if not remaining:
            print(f"cached {language}: {len(english)} strings", flush=True)
            return code, {key: cached[key] for key in english}
        partial_schema = {
            "type": "object",
            "properties": {key: {"type": "string"} for key in remaining},
            "required": list(remaining),
            "additionalProperties": False,
        }
        response = client.chat.completions.create(
            model="gpt-5-mini",
            max_completion_tokens=16000,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a careful translator for an Indian farmer-facing mobile app. "
                        f"Translate into natural, respectful, very simple {language} as used in India. "
                        "Use the correct native script. Favor short familiar spoken sentences understood by farmers with limited literacy. "
                        "Do not leave English phrases except brand names, file formats, and unavoidable technical names. "
                        "Preserve every safety limitation exactly: this is only a sample; it has NO tested crop-disease photo system, "
                        "NO live weather, and gives NO pesticide recommendation. Never imply a disease has been diagnosed, a forecast is live, "
                        "or that pesticide should be applied. Translate meaning, not word-for-word jargon. Keep every JSON key unchanged. "
                        "Return exactly the required JSON object."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Translate these UI strings to {language} ({native_name}):\n{json.dumps(remaining, ensure_ascii=False)}",
                },
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": f"agrishield_{code}",
                    "strict": True,
                    "schema": partial_schema,
                },
            },
        )
        content = response.choices[0].message.content
        if not content:
            reason = response.choices[0].finish_reason
            refusal = response.choices[0].message.refusal
            raise RuntimeError(f"{language}: model returned empty content (finish_reason={reason}, refusal={refusal})")
        values = {**cached, **json.loads(content)}
        if set(values) != set(english):
            missing = sorted(set(english) - set(values))
            extra = sorted(set(values) - set(english))
            raise RuntimeError(f"{language}: key mismatch missing={missing} extra={extra}")
        for key, source in english.items():
            if "{" in source and any(token not in values[key] for token in [source[i:source.find("}", i)+1] for i,c in enumerate(source) if c == "{"]):
                raise RuntimeError(f"{language}: placeholder lost in {key}")
        CACHE.mkdir(parents=True, exist_ok=True)
        cached_file.write_text(json.dumps(values, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"translated {language}: {len(values)} strings", flush=True)
        return code, values

    translations = {"en": english}
    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(translate, item): item for item in LANGUAGES.items()}
        for future in concurrent.futures.as_completed(futures):
            code = futures[future][0]
            try:
                locale, values = future.result()
                translations[locale] = values
            except Exception as error:
                print(f"FAILED {code}: {error}", flush=True)
                failures.append((code, error))
    if failures:
        raise RuntimeError(f"Failed locales: {', '.join(code for code, _error in failures)}")
    OUTPUT.write_text(json.dumps(translations, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes); locales={len(translations)} keys={len(english)}")


if __name__ == "__main__":
    main()
