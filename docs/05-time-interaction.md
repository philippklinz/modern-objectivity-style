# 05 — Time & Interaction

## Interactions change state

A meaningful action requires **preconditions → input → acknowledgment → processing → outcome or failure → recovery**. A click animation is not enough.

## State vocabulary

| State | Meaning | Design requirement |
| --- | --- | --- |
| Initial | Data not requested | Do not confuse with empty |
| Loading | Work in progress | Explain activity, prevent harmful duplication |
| Ready | Content usable | Make next actions discoverable |
| Empty | No records exist | Explain how to proceed |
| No results | Filters match nothing | Provide a way to revise filters |
| Partial | Some content unavailable | Make limits visible |
| Stale | Data may be outdated | Show freshness or refresh path |
| Error | Operation failed | Explain and enable recovery |
| Forbidden | Access denied | Do not disguise as missing records |
| Disabled | Action unavailable | Explain why where relevant |

Not every control needs every state. Specify the applicable subset explicitly.

## Feedback, reversibility, and focus

Report whether work has succeeded, failed, or has an unknown outcome. Never fabricate progress percentages. Support undo or recovery for high-impact actions where feasible. Dialogs should manage keyboard focus reliably.

Within a system, keep selection, hover, keyboard focus, and active navigation distinguishable. Preserve the user's search/filter context when returning from a detail page if appropriate.

## Motion

Distinguish **functional motion** that clarifies transitions, **data-driven motion** that depicts changing values, and **atmospheric motion** that creates an experience. Each requires different evaluation. Provide reduced-motion alternatives and never hide critical meaning in brief animation.

## Time as content

Time ranges, timestamps, update cadence, and freshness affect meaning. Mark live, cached, historical, simulated, and predicted data when applicable. Avoid automatic content reordering that disrupts reading.

## Emotional dramaturgy

Emotional Intent may evolve across a task: curiosity at entry, concentration during work, appropriate concern at real risks, and satisfaction after confirmed success. This is a planned hypothesis, not an emotional guarantee.
