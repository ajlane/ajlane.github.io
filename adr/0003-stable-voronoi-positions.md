# ADR 0003: Stable Voronoi cell positions

## Status
Accepted

## Context
Updating the background gradient or dropping an image previously regenerated a
completely new set of Voronoi sample points. Even though colours smoothly
interpolated, each cell also jumped to a different location. Only the periodic
`perturbPoints` updates were meant to move cells gradually.

## Decision
Keep the original point positions when changing backgrounds. The
`pointsFromImage` loader now copies the current positions and simply replaces
colour values. Drag-and-drop therefore updates only colours while the cells stay
put. Periodic calls to `perturbPoints` still add subtle drift.

## Consequences
Background transitions appear smoother because cell layouts remain consistent.
Image drops no longer cause sudden jumps, maintaining the gentle animation.
