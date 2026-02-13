# rio-de-js Agent Rules

These rules are mandatory for all code changes in `rio-de-js`.

## Core Principle
- Functional style is required by default.
- Prefer pure, composable, deterministic functions.
- Write code as transformations of data, not mutation of shared state.

## Required Functional Standards
- Use small single-purpose functions.
- Keep functions total when possible (handle all expected inputs explicitly).
- Pass dependencies via arguments instead of reading hidden globals.
- Return new values instead of mutating inputs.
- Favor expression-oriented code and data pipelines over imperative branching.
- Use declarative array/object operations (`map`, `filter`, `reduce`, `Object.entries`, etc.) where clarity improves.
- Isolate side effects (I/O, network, filesystem, timers, random, process env) at module boundaries.
- Make side-effecting functions explicit by naming and placement.
- Use immutable update patterns for objects/arrays.
- Validate inputs at boundaries; keep core logic pure.
- Keep functions referentially transparent unless side effects are intentionally required.

## Strict Prohibitions
- Do not mutate function arguments.
- Do not rely on implicit shared mutable state.
- Do not mix business logic with side effects in the same function.
- Do not hide side effects inside utility helpers with pure-sounding names.
- Do not introduce classes when a plain function/module is sufficient.
- Do not use `var`.
- Do not use long stateful procedures when a composition of pure helpers is possible.

## Error Handling
- Represent recoverable failures as explicit values where practical.
- Throw only for truly exceptional/invalid states.
- Keep error messages deterministic and actionable.

## Naming and Readability
- Use verb-first names for functions (`buildConfig`, `parseInput`, `createSession`).
- Use noun names for immutable values.
- Prefer explicit parameters over hidden context.
- Keep functions short; extract helpers instead of deeply nested logic.

## Testing Expectations
- Unit tests should primarily target pure functions.
- Side effects must be covered via boundary/integration tests.
- Tests must avoid order coupling and shared mutable fixtures.

## Change Acceptance Gate
A change is not acceptable unless:
- Core logic is implemented as pure functions or clearly separated functional units.
- Side effects are isolated and visible.
- Input/output behavior is deterministic under test.
- No avoidable mutation or hidden state is introduced.

## Refactor Priority
When touching legacy code:
- First preserve behavior with tests.
- Then extract pure helpers.
- Then isolate side effects.
- Then simplify into composable functions.

These standards are always enforced for `rio-de-js`.
