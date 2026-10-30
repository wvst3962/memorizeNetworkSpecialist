"""Build the static quiz data from the reviewed question bank."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "一問一答問題集.md"
OUTPUT = ROOT / "docs" / "quiz" / "questions.json"
LINK = re.compile(r"\[([^\]]+)\]\((docs/study/[A-Za-z0-9._-]+\.html)\)")


def build() -> list[dict[str, str]]:
    section = ""
    questions: list[dict[str, str]] = []
    seen_questions: set[str] = set()

    for line_number, line in enumerate(SOURCE.read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("## "):
            section = line.removeprefix("## ").strip()
        if not re.match(r"^\| Q\d{3} \|", line):
            continue

        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) != 5 or not section:
            raise ValueError(f"{SOURCE.name}:{line_number}: invalid question row")
        question_id, prompt, answer, note, link = cells
        expected_id = f"Q{len(questions) + 1:03d}"
        if question_id != expected_id:
            raise ValueError(f"{SOURCE.name}:{line_number}: expected {expected_id}")
        if not prompt or not answer or not note or prompt in seen_questions:
            raise ValueError(f"{SOURCE.name}:{line_number}: empty or repeated content")

        match = LINK.fullmatch(link)
        if not match or not (ROOT / match.group(2)).is_file():
            raise ValueError(f"{SOURCE.name}:{line_number}: missing study page: {link}")
        seen_questions.add(prompt)
        questions.append(
            {
                "id": question_id,
                "section": section,
                "question": prompt,
                "answer": answer,
                "note": note,
                "study_title": match.group(1),
                "study_href": "../" + match.group(2).removeprefix("docs/"),
            }
        )

    if not questions:
        raise ValueError("No questions found")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return questions


if __name__ == "__main__":
    questions = build()
    print(f"Built {len(questions)} questions across {len({q['section'] for q in questions})} sections")
