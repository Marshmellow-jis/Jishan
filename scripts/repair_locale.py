#!/usr/bin/env python3
"""Repair the small set of locale strings flagged by the Unicode script audit."""
import concurrent.futures
import json
import unicodedata
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
EN_PATH = ROOT / "src/i18n/en.json"
OUTPUT = ROOT / "src/i18n/locales.json"
CACHE = ROOT / "src/i18n/.translation-cache"
LANGUAGES = {
    "bn": ("Bengali", 0x0980, 0x09FF),
    "gu": ("Gujarati", 0x0A80, 0x0AFF),
    "ta": ("Tamil", 0x0B80, 0x0BFF),
    "ml": ("Malayalam", 0x0D00, 0x0D7F),
    "kn": ("Kannada", 0x0C80, 0x0CFF),
    "pa": ("Punjabi", 0x0A00, 0x0A7F),
    "or": ("Odia", 0x0B00, 0x0B7F),
}
FIXES = {
    "bn": ["simple.label", "simple.on", "simple.off"],
    "gu": ["field.empty", "history.verified", "public.aboutTag"],
    "ta": ["public.safety"],
    "ml": ["login.safe", "advisory.note"],
    "kn": ["lang.translationNote", "field.plantingDate", "scan.cameraHint", "history.empty"],
    "pa": ["lang.help"],
    "or": ["scan.noAi"],
}


def foreign_letters(value: str, code: str) -> list[str]:
    _name, start, end = LANGUAGES[code]
    bad = []
    for char in value:
        category = unicodedata.category(char)
        if ord(char) < 128 or char.isspace() or category.startswith(("P", "N", "M")) or category == "Cf":
            continue
        if not start <= ord(char) <= end:
            bad.append(f"{char!r} U+{ord(char):04X} {unicodedata.name(char, 'UNKNOWN')}")
    return bad


def atomic_json(path: Path, data: dict) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main() -> None:
    english = json.loads(EN_PATH.read_text(encoding="utf-8"))
    catalogs = json.loads(OUTPUT.read_text(encoding="utf-8"))
    client = OpenAI()

    def repair(code: str) -> tuple[str, dict[str, str]]:
        name, start, end = LANGUAGES[code]
        keys = FIXES[code]
        schema = {
            "type": "object",
            "properties": {key: {"type": "string"} for key in keys},
            "required": keys,
            "additionalProperties": False,
        }
        issues = ""
        for attempt in range(1, 4):
            system = (
                f"Translate these farmer-app phrases into clear, natural, respectful {name} as used in India. "
                f"Write {name} letters only from Unicode U+{start:04X} through U+{end:04X}. "
                "Do not insert letters from another Indian language, Latin transliterations, Korean, Cyrillic, Arabic, or other scripts. "
                "ASCII brand names are allowed only if essential. Use short everyday sentences and preserve safety meaning. "
                "Return the exact JSON keys."
            )
            user = f"English source phrases: {json.dumps({key: english[key] for key in keys}, ensure_ascii=False)}"
            if issues:
                user += f"\nThe previous attempt had invalid characters: {issues}. Replace those phrases using ONLY the requested script range."
            response = client.chat.completions.create(
                model="gpt-5-mini",
                max_completion_tokens=2400,
                messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                response_format={
                    "type": "json_schema",
                    "json_schema": {"name": f"repair_{code}", "strict": True, "schema": schema},
                },
            )
            content = response.choices[0].message.content
            if not content:
                raise RuntimeError(f"{name}: empty response on attempt {attempt}")
            values = json.loads(content)
            problems = []
            if set(values) != set(keys):
                problems.append("key mismatch")
            for key, value in values.items():
                bad = foreign_letters(value, code)
                if bad:
                    problems.append(f"{key}: {', '.join(bad)}")
                for token in ("{" + segment.split("}", 1)[0] + "}" for segment in english[key].split("{")[1:]):
                    if token not in value:
                        problems.append(f"{key}: missing placeholder {token}")
            if problems:
                issues = "; ".join(problems)
                print(f"retry {name} ({attempt}/3): {issues}", flush=True)
                continue
            return code, values
        raise RuntimeError(f"{name}: script validation failed after retries: {issues}")

    failures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(repair, code): code for code in FIXES}
        for future in concurrent.futures.as_completed(futures):
            code = futures[future]
            try:
                locale, values = future.result()
                catalogs[locale].update(values)
                atomic_json(OUTPUT, catalogs)
                cache_path = CACHE / f"{locale}.json"
                if cache_path.exists():
                    cache = json.loads(cache_path.read_text(encoding="utf-8"))
                    cache.update(values)
                    atomic_json(cache_path, cache)
                print(locale, json.dumps(values, ensure_ascii=False), flush=True)
            except Exception as error:
                failures.append((code, str(error)))
                print(f"FAILED {code}: {error}", flush=True)
    if failures:
        raise RuntimeError(f"Failed locales: {failures}")
    print("Saved corrected strings to the locale catalog and translator cache.")


if __name__ == "__main__":
    main()
