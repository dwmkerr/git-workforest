## MODIFIED Requirements

### Requirement: migrate shows cd hint after completion
The CLI SHALL print the cd hint immediately after the spinner with no blank line.

#### Scenario: no blank line before cd hint
- **WHEN** migration completes successfully
- **THEN** the CLI SHALL print the dimmed comment and cd path immediately after the spinner line with no blank line between them
