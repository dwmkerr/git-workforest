## MODIFIED Requirements

### Requirement: clone creates forest structure
The CLI SHALL clone the repo, detect the default branch, place the clone in a subfolder named after the default branch, and write a `.workforest.yaml` marker containing the git remote URL.

#### Scenario: successful clone
- **WHEN** clone completes
- **THEN** the forest root SHALL contain a `.workforest.yaml` file with a top-level `remote:` key set to the git remote URL, and a subdirectory named after the default branch containing the cloned repo
