# OpenClaw Workflow For JBL

Use fewer sessions. Use clearer branches. Keep one source of truth.

## Which Workspace To Use

Use:

`D:\AI\openclaw\.openclaw\workspace\jbl-biz-law`

Avoid:

`D:\AI\openclaw\.openclaw\workspace\coding\JBL-BIZ-LAW`

The second folder is a duplicate from earlier work and can confuse agents.

## How To Start A New JBL Session

Start by saying the exact workspace and one task:

```text
Work in D:\AI\openclaw\.openclaw\workspace\jbl-biz-law.
Create branch task/fix-chat-wiring.
Fix only chat API wiring so it follows Mike behavior using the new Next.js/Drizzle backend.
Run lint and build. Do not change unrelated UI.
```

Good session prompts include:

- the exact folder
- the branch name
- the one task
- what not to touch
- required verification

## When To Use Subsessions

Use one main session for normal work.

Use subsessions only when tasks are independent, for example:

- one session audits auth
- one session audits R2 upload routes
- one session audits Arabic/RTL UI

Do not open three sessions that all edit the same files.

## Branch Naming

Use:

- `task/fix-chat-wiring`
- `task/r2-upload-port`
- `task/rtl-layout-polish`
- `task/admin-route-cleanup`

Avoid:

- random names
- duplicate task branches
- branches named only `test`, `fix`, or `new`

## Session Cleanup Rule

At the end of every OpenClaw task, ask it to produce:

- files changed
- commands run
- tests/build result
- remaining risks
- whether the session can be archived

Then archive finished sessions instead of leaving them active.

## Current Cleanup Result

Finished JBL-related session logs were archived on 2026-05-25.

Human-readable summary:

`docs/openclaw-session-archive/SUMMARY.md`

Raw logs:

`docs/openclaw-session-archive/raw`

Runtime archive:

`D:\AI\openclaw\.openclaw\agents\coding\sessions\archive\jbl-2026-05-25`
