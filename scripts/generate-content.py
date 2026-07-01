#!/usr/bin/env python3
"""
PPC Companion — CrewAI content generation pipeline.
Generates curriculum modules, exercises, and quizzes matching the course-data.ts
type system. Outputs JSON importable into the app.

Usage:
  OPENROUTER_API_KEY=sk-or-... ./scripts/generate-content.py "Sponsored Brands" --phase 2 --module 2.1
  ./scripts/generate-content.py "Search Term Optimization" --phase 1 --module 1.3 -o output.json
  ./scripts/generate-content.py --list-topics
"""

import argparse
import json
import os
import re
import sys
from typing import Optional

LLM_MODEL = os.getenv("CREW_MODEL", "openrouter/deepseek/deepseek-v4-flash")
LLM_KEY = os.getenv("OPENROUTER_API_KEY")
LLM_BASE = "https://openrouter.ai/api/v1"

if not LLM_KEY:
    print("FATAL: Set OPENROUTER_API_KEY env var or pass --api-key", file=sys.stderr)
    sys.exit(1)

os.environ["OPENAI_API_KEY"] = LLM_KEY
os.environ["OPENAI_BASE_URL"] = LLM_BASE

from crewai import Agent, Task, Crew, Process, LLM


# ── Topic suggestions ────────────────────────────────────────────────────────

TOPICS = {
    1: {
        "title": "Foundations",
        "modules": [
            ("1.1", "How Amazon Works"),
            ("1.2", "PPC Metrics Fundamentals — ACoS, TACoS, ROAS, CTR, CVR"),
            ("1.3", "Search Term Analysis Basics"),
        ],
    },
    2: {
        "title": "Amazon Ads Deep Dive",
        "modules": [
            ("2.1", "Sponsored Brands Campaign Structure"),
            ("2.2", "Sponsored Display & DSP Overview"),
            ("2.3", "Keyword Match Types & Negative Targeting"),
        ],
    },
    3: {
        "title": "Advanced Strategy",
        "modules": [
            ("3.1", "Bidding Strategies & Portfolio Management"),
            ("3.2", "Campaign Architecture & Segmentation"),
            ("3.3", "Performance Analysis & Optimization Cycles"),
        ],
    },
    4: {
        "title": "Capstone",
        "modules": [
            ("4.1", "Building a Full PPC Strategy"),
        ],
    },
}


# ── Agents ───────────────────────────────────────────────────────────────────

def make_agents(llm: LLM):
    researcher = Agent(
        role="PPC Research Analyst",
        goal="Find accurate current Amazon PPC information for training",
        backstory=(
            "You specialise in Amazon advertising, PPC campaign structures, "
            "bidding strategies, and marketplace trends. You cite real data "
            "and avoid speculation."
        ),
        llm=llm,
        verbose=False,
    )

    writer = Agent(
        role="PPC Curriculum Writer",
        goal="Write structured training modules matching the PPC Companion type system",
        backstory=(
            "You write clear practical training content for Amazon sellers "
            "and virtual assistants. Every module uses real PPC scenarios."
        ),
        llm=llm,
        verbose=False,
    )

    quiz_designer = Agent(
        role="PPC Quiz Designer",
        goal="Create accurate well-constructed quiz questions and exercises",
        backstory=(
            "You design assessments that test real understanding of PPC concepts. "
            "Include MCQ, numeric, and open-answer formats with model answers."
        ),
        llm=llm,
        verbose=False,
    )

    return researcher, writer, quiz_designer


# ── Tasks ────────────────────────────────────────────────────────────────────

STRUCTURE_HINT = {
    "module": {
        "code": "2.1",
        "title": "Module Title",
        "content": [
            {
                "heading": "Section Heading",
                "type": "text | list | definition | table | flow",
                "body": "paragraph text (for text type)",
                "items": [{"term": "Key Term", "description": "Definition"}],
                "columns": ["Metric", "Formula"],
                "rows": [["ACoS", "Ad Spend / Revenue x 100"]],
                "steps": [{"title": "Step 1", "description": "Do this"}],
            }
        ],
        "exercises": [
            {
                "id": "2.1A",
                "title": "Exercise title",
                "prompt": "Scenario description",
                "type": "open | calculation | choice | decision",
                "modelAnswer": "Expected answer (for open type)",
            }
        ],
    },
    "quiz_questions": [
        {
            "id": "q-2.1-1",
            "question": "Question text",
            "type": "open | numeric | mcq",
            "modelAnswer": "Correct answer",
            "options": [{"id": "a", "label": "Option", "correct": False}],
        }
    ],
}


def make_tasks(agents, phase_number: int, module_code: str, topic: str):
    researcher, writer, quiz_designer = agents
    hint = json.dumps(STRUCTURE_HINT, indent=2)

    research = Task(
        description=(
            f"Research: Phase {phase_number}, module {module_code} — {topic}. "
            "Focus on actionable Amazon PPC information. Include key concepts, "
            "metrics, examples, and common mistakes."
        ),
        expected_output="Structured research brief",
        agent=researcher,
    )

    write_module = Task(
        description=(
            f"Write module content for Phase {phase_number}, module {module_code}: {topic}.\n"
            f"Output valid JSON matching this structure:\n{hint}\n\n"
            "Include 2-4 content sections (mix text, definitions, examples) and "
            "1-2 exercises with real PPC scenarios. Output ONLY valid JSON."
        ),
        expected_output="JSON object with module content + exercises",
        agent=writer,
        context=[research],
    )

    design_quiz = Task(
        description=(
            f"Design 3-4 quiz questions for Phase {phase_number}, module {module_code}: {topic}.\n"
            f"Output valid JSON matching this structure:\n{hint}\n\n"
            "Mix MCQ, numeric calculation, and open-answer. Output ONLY valid JSON."
        ),
        expected_output="JSON array of quiz questions",
        agent=quiz_designer,
        context=[research],
    )

    return research, write_module, design_quiz


# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_json(text: str) -> Optional[dict]:
    """Extract JSON from LLM output, handling markdown fences."""
    text = re.sub(r"^REVIEW_PASSED\s*\n?", "", text, flags=re.MULTILINE)
    match = re.search(r"```(?:json)?\s*\n(.*?)\n```", text, re.DOTALL)
    if match:
        text = match.group(1)
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        return None


def list_topics():
    for phase_num, phase in TOPICS.items():
        print(f"\nPhase {phase_num}: {phase['title']}")
        for code, topic in phase["modules"]:
            print(f"  {code}  {topic}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate PPC training content with CrewAI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  OPENROUTER_API_KEY=sk-or-... %(prog)s \"Sponsored Brands\" --phase 2 --module 2.1\n"
            "  %(prog)s \"Search Terms\" --phase 1 --module 1.3 -o output.json\n"
            "  %(prog)s --list-topics\n"
        ),
    )
    parser.add_argument("topic", nargs="?", help="Topic for the module")
    parser.add_argument("--phase", type=int, default=2, help="Phase number (1-4)")
    parser.add_argument("--module", default="2.1", help="Module code (e.g. 2.1)")
    parser.add_argument("--api-key", help="OpenRouter API key")
    parser.add_argument("--model", default=LLM_MODEL, help="LLM model identifier")
    parser.add_argument("--output", "-o", help="Output file path")
    parser.add_argument("--list-topics", action="store_true", help="Show available topics and exit")
    parser.add_argument("--all", action="store_true", help="Generate all modules for a phase")
    args = parser.parse_args()

    if args.list_topics:
        list_topics()
        sys.exit(0)

    if not args.topic:
        print("ERROR: topic is required. Use --list-topics to see options.", file=sys.stderr)
        sys.exit(1)

    if args.api_key:
        os.environ["OPENAI_API_KEY"] = args.api_key
        os.environ["OPENROUTER_API_KEY"] = args.api_key

    llm = LLM(
        model=args.model,
        api_key=os.environ["OPENAI_API_KEY"],
        base_url=LLM_BASE,
    )

    agents = make_agents(llm)
    phase = max(1, min(4, args.phase))
    tasks = make_tasks(agents, phase, args.module, args.topic)

    crew = Crew(
        agents=agents,
        tasks=list(tasks),
        process=Process.sequential,
        verbose=False,
    )

    print(f"Generating Phase {phase}, Module {args.module}: {args.topic}...", file=sys.stderr)
    print(f"Model: {args.model}", file=sys.stderr)
    print(file=sys.stderr)

    result = crew.kickoff()

    # Extract structured output from each task via the raw result
    raw = str(result)

    # Try to extract module JSON and quiz JSON from the aggregated output
    module_data = extract_json(raw)

    # Build combined output
    output = {
        "phase": phase,
        "module": args.module,
        "topic": args.topic,
        "generated_at": __import__("datetime").datetime.now().isoformat(),
        "model": args.model,
        "content": module_data or {"raw": raw},
    }

    out = json.dumps(output, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(out)
        print(f"Written to {args.output}", file=sys.stderr)
    else:
        print(out)


if __name__ == "__main__":
    main()
