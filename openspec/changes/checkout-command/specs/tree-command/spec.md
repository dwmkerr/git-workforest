## REMOVED Requirements

### Requirement: tree creates a worktree for a branch
**Reason**: Replaced by `checkout` command which creates trees and prints cd hint
**Migration**: Use `git forest checkout <branch>` instead of `git forest tree <branch>`

### Requirement: tree supports fat clones
**Reason**: Replaced by `checkout` command which handles fat clone mode
**Migration**: Use `git forest checkout <branch>` — fat clone behavior is preserved

### Requirement: tree detects forest root
**Reason**: Replaced by `checkout` command
**Migration**: Use `git forest checkout <branch>`
