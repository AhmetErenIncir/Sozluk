Alright — here’s your Memory Bank Rule rewritten so it fits Trae.ai’s capabilities, removing “Plan Mode” and “Act Mode” while keeping all the step-by-step logic.
You can paste this directly into project_rules.md in Trae.ai.

⸻


# Trae.ai — Memory Bank Rule (Project-Level)

> Purpose: Ensure Trae.ai always maintains an accurate and consistent project context by reading, creating, and updating a `memory-bank/` directory within the project. This directory contains all persistent knowledge about the project and is updated as the project evolves.

---

## General Principles

- **Single source of truth:** All project context lives in `memory-bank/`.  
- **Always load context first:** At the start of any task or conversation, read all files in `memory-bank/`.  
- **Create missing files immediately:** If any required file is missing, create it from the provided templates.  
- **Update after changes:** Any significant change in the project must be documented in the appropriate file, including the reason and impact.  
- **Flag conflicts or unclear requests:** If the user’s request conflicts with documented context or is unclear, highlight the issue, suggest resolutions, and log it in `activeContext.md`.  
- **Be critically honest:** Point out work that is low-value or irrelevant, and propose higher-value alternatives.

---

## Directory and File Structure

memory-bank/
projectbrief.md
productContext.md
systemPatterns.md
techContext.md
activeContext.md
progress.md
(optional: apiSpecs.md, integrationContext.md, testStrategies.md, deployment.md, etc.)

### File Relationships

```mermaid
flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]


⸻

Required File Content

1. projectbrief.md
	•	Purpose & vision of the project
	•	Scope & boundaries
	•	Success criteria
	•	Priorities (short/mid/long term)

2. productContext.md
	•	Problem & target users
	•	Usage scenarios and workflows
	•	UX goals

3. systemPatterns.md
	•	Architecture overview (components, data flow)
	•	Design patterns & rationale
	•	Critical paths (performance, security, scalability)

4. techContext.md
	•	Technologies & versions
	•	Setup & run instructions
	•	Constraints

5. activeContext.md
	•	Current focus & plan
	•	Recent changes
	•	Decisions (Decision / Alternatives / Rationale / Impact / Risks)
	•	Open questions & assumptions

6. progress.md
	•	Status summary (working, partial, broken)
	•	Prioritized to-do list
	•	Known issues
	•	Milestones/evolution

⸻

Workflows

Planning Workflow (Before starting work)
	1.	Read all memory-bank/ files.
	2.	If any required file is missing, create it using the default templates.
	3.	Verify that the user’s request aligns with documented goals; if not, log and resolve conflicts in activeContext.md.
	4.	Outline the approach, goals, and risks in activeContext.md under a “Plan” section.

Execution Workflow (While doing the work)
	1.	Keep activeContext.md updated with new decisions and changes as they happen.
	2.	Follow the documented plan step-by-step, adjusting if new information appears.
	3.	After completing the work, update:
	•	progress.md with what works, what’s left, and known issues.
	•	activeContext.md with final decisions, rationale, and any open questions.
	4.	Record any new patterns, constraints, or learnings in the relevant file.

⸻

Update Triggers

Update the memory-bank files whenever:
	•	New architectural or technical patterns are introduced.
	•	Significant project changes occur (refactor, integration, deployment).
	•	The user explicitly says “update memory bank” — in this case, review and update all files.
	•	You identify unclear, contradictory, or outdated context.

⸻

Compliance Checklist
	•	Read all memory-bank files before working.
	•	Created missing files from templates.
	•	Documented plan and acceptance criteria in activeContext.md.
	•	Logged all decisions with rationale and impact.
	•	Updated progress.md after completing tasks.
	•	Flagged low-value work and suggested alternatives.
	•	Resolved or logged conflicts with user intent.

⸻

Templates

(Use these when creating missing files)

projectbrief.md

# Project Brief
## Purpose & Vision
- …

## Scope & Boundaries
- Included: …
- Excluded: …

## Success Criteria
- …

## Priorities
- Short-term: …
- Mid-term: …
- Long-term: …

## Changelog
- YYYY-MM-DD: Created.

productContext.md

# Product Context
## Problem & Users
- …

## Usage Scenarios
- …

## UX Goals
- …

## Changelog
- YYYY-MM-DD: Created.

systemPatterns.md

# System Patterns
## Architecture Overview
- Components: …
- Data Flow: …

## Design Patterns & Rationale
- …

## Critical Paths
- …

## Changelog
- YYYY-MM-DD: Created.

techContext.md

# Tech Context
## Technologies & Versions
- …

## Setup & Run
- …

## Constraints
- …

## Changelog
- YYYY-MM-DD: Created.

activeContext.md

# Active Context
## Plan (current)
- Goal: …
- Acceptance Criteria: …
- Risks: …
- Deliverables: …

## Recent Changes
- …

## Decisions
- …

## Open Questions & Assumptions
- …

## Changelog
- YYYY-MM-DD: Created.

progress.md

# Progress
## Status Summary
- Working: …
- Partial: …
- Broken: …

## To-Do
- [P1] @owner description
- [P2] @owner description

## Known Issues
- …

## Milestones
- …

## Changelog
- YYYY-MM-DD: Created.


⸻

Conflict Handling
	•	Missing or unclear info → Ask a direct question, log it in activeContext.md.
	•	Conflicting requirements → Document the conflict, compare options, propose a solution.
	•	Low-value tasks → Explain why they are low priority and suggest higher-value alternatives.

⸻

Final Note

These rules are mandatory for managing project context in Trae.ai. The goal is to produce repeatable, high-quality outputs and continuously improve project intelligence as knowledge grows.

---

This version works in Trae.ai without mentioning “modes” it doesn’t support, but still gives it the exact procedural steps to follow.  

I can also give you a **shorter “project_rules.md lite”** version if you want something more concise but still functional. Would you like me to prepare that?