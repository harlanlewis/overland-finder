# Grind config - overland-finder

## Tracker
- beads (`bd`), prefix `overland-finder-`
- Maintainer-only kinds: none

## Gates
- Per commit: `pnpm validate && pnpm test` (the husky pre-commit hook runs the same pair)
- Merge gate: `pnpm validate && pnpm test && pnpm build`
- Visual pass: none; the app renders `src/vehicles.json` as-is
- CI down: there is no CI; the local merge gate is the verdict

## Landing
- PR + merge commit into `main` (the repo's history so far)
- Merging deploys: yes → Vercel (overland-finder.vercel.app)
- The session completes the merge: yes
- PRs open as draft: no
- Last act, after the pull: none

## Lanes
- Serial for writes: every ticket touches `src/vehicles.json` and the `scripts/*.json` data files. Research fans out to subagents that write only to the scratchpad; the orchestrator is the only writer in the tree.
- Session target: the queue
- Hot files: `src/vehicles.json`, `scripts/*.json`
- Orchestrator-only files: `VEHICLE_EXPANSION_PLAN.md` progress log, `README.md` vehicle count
- Exclusive resources: none

## Priority doctrine
Wrong beats missing: fix entries that state something false today (a discontinued vehicle shown as on sale, a stale generation) before adding new ones. Sourced over complete: an unverified number stays out rather than going in as a guess.

## Repo law
Read before touching data: `README.md` (schema, data-file map, Web Research Guide), `scripts/passion-score-methodology.md`, `.claude/agents/researcher.md`.

## Repo lore
- An ended generation's `price` is typical used value, not its last MSRP (README Scales).
- Never fill specs from model memory; every number traces to a fetched or searched source.
- CarsDirect and KBB new-car prices include destination; cars.com trim tables and maker configurators do not. Back destination out before comparing, or every price looks 2-4% higher than it is.
- WebSearch has one budget per session, shared with every subagent (200 calls). A broad audit spends it; brief research lanes to WebFetch (CarsDirect, cars.com, Wikipedia, EPA/NHTSA APIs, media.stellantisnorthamerica.com) first.
