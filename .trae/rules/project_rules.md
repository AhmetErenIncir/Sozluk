name: Keep trae.md in sync with project changes
type: project
description: >
  Ensure that the trae.md file reflects the current state of the project.
  Every time the codebase changes in a meaningful way, this file must be updated accordingly.
triggers:
  - file_created
  - file_deleted
  - file_modified
  - command_changed
  - env_variable_changed
  - api_surface_changed
  - model_structure_changed
  - architecture_modified
actions:
  - analyze_repository
  - update_or_generate_trae_md
  - validate_all_command_blocks
  - regenerate_api_reference
  - update_env_block
  - summarize_changes_under_changes_summary
  - annotate_warnings_and_assumptions
requirements:
  - All CLI commands in the "Quick Start" section must be executable.
  - .env keys must be listed (values redacted).
  - API section must reflect current backend endpoints and integrations.
  - Changes must be reflected under the "Change Summary" section at the bottom of the file.
  - Any inconsistency or missing part must be annotated using "Warning:" or "Assumption:" markers.
severity: critical
enforced: true