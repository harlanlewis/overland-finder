---
name: beads
description: >
  Persistent task tracking with Beads (bd CLI). Use when starting a work session,
  creating or managing tasks, tracking dependencies, or ending a session. Activates
  when the user mentions tasks, issues, work items, planning, or when a .beads/
  directory exists in the project.
compatibility: Requires bd CLI installed globally (npm, brew, or go install)
allowed-tools: Bash(bd:*)
metadata:
  author: trifeclaw
  version: "1.0"
---

# Beads Task Tracking

Beads (`bd`) is a distributed, git-backed issue tracker for AI agents. It replaces markdown task lists with a dependency-aware graph that persists across sessions.

## When to use this skill

- At the **start of every work session** to check for ready work
- When you need to **create, update, or close** tasks
- When tracking **dependencies** between pieces of work
- At the **end of a session** to sync state and hand off context
- When the user asks about tasks, issues, work items, or project status

## Session start workflow

```bash
bd ready                        # What's unblocked and ready to work on?
bd show <id>                    # Read the details
bd update <id> --claim          # Atomically assign + mark in_progress
```

Always check `bd ready` before creating new tasks to avoid duplicates.

## Subagent dispatch after claiming

After claiming a task, check whether it should be delegated to a subagent:

| Task signal | Action |
|---|---|
| Title contains "Research" or a vehicle batch | Spawn `researcher` subagent via Task tool |
| `issue_type: "epic"` with subtasks | Orchestrate subtasks individually; parallelize independent ones |
| Everything else | Work directly in this conversation |

The `researcher` agent declares `isolation: worktree`, so each one gets its own checkout. **Launch them one per message** and verify each result's `worktreePath` — canonical rule and evidence in `~/.claude/CLAUDE.md` § Worktree isolation.

For research tasks (especially passion score batches), get the full details and spawn:

```bash
bd show <id> --json   # Get full task context for the subagent prompt
```

Then pass the task title, description, vehicle list, and scoring criteria to a `researcher` subagent via the Task tool. The researcher agent knows the passion score methodology and will produce structured JSON. After the subagent returns, update the beads task with a comment summarizing findings:

```bash
bd comment <id> --text "Research complete. Findings: ..."
```

## Creating tasks

```bash
bd create --title "Fix filter bug" --priority high --type bug
bd create --title "Add new vehicle batch" --priority normal --type feature
bd create --title "Recalculate scores" --priority low --type task
```

Priorities: `critical` (0), `high` (1), `normal` (2), `low` (3), `backlog` (4). Types: `bug`, `feature`, `task`, `epic`, `chore`.

### Epics and subtasks

```bash
bd create --title "Vehicle expansion phase 2" --type epic
bd create --title "Add midsize trucks" --parent bd-a3f8    # creates bd-a3f8.1
```

### Discovered work

When you find new work while working on a task, link it to the parent:

```bash
bd create --title "Edge case in score calc" --deps discovered-from:bd-a3f8
```

## Updating tasks

```bash
bd update <id> --status in_progress
bd update <id> --status done
bd update <id> --priority critical
bd close <id>                              # close with default reason
bd close <id> --reason "Fixed in abc123"   # close with explanation
bd reopen <id>
```

## Dependencies

```bash
bd dep add <child> --blocks <parent>       # hard dependency
bd dep add <id> --related <other>          # soft link
```

## Querying

```bash
bd ready                                   # unblocked tasks
bd list                                    # all open tasks
bd list --status in_progress               # what's being worked on
bd list --priority critical                # urgent items
bd list --type bug                         # all bugs
bd show <id>                               # full details + audit trail
bd search "passion"                        # text search
```

Always use `--json` when you need to parse output programmatically.

## Session end workflow

Before ending a session, you **must** complete all of these:

1. Create issues for any remaining work discovered during the session
2. Update statuses — close finished work, note in-progress items
3. Sync and push:

```bash
bd sync
git add -A && git commit -m "session wrap-up"
git pull --rebase && git push
```

4. Provide context for the next session (what's done, what's next, any blockers)

## Dashboard sync

A PostToolUse hook auto-exports to `.beads/issues.jsonl` after `bd create`, `bd update`, `bd close`, and `bd reopen`. If the hook isn't running (e.g. in a subagent without hooks), manually export:

```bash
bd export -o .beads/issues.jsonl
```

## Key rules

- Tasks are persistent memory — they survive across sessions
- Always check `bd ready` before creating tasks to avoid duplicates
- Use `--claim` to atomically assign and start work (prevents races)
- Link discovered work to parent tasks with `--deps discovered-from:<id>`
- Work is **not complete** until `git push` succeeds
