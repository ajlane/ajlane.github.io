# ADR 0002: Smooth Voronoi point transitions

## Status
Accepted

## Context
Randomising a completely new set of Voronoi sample points every time the background hue changes makes each point jump across the canvas. The interpolation logic maps old points to these new random locations so positions and colours change abruptly despite the five second duration.

## Decision
Introduce a `perturbPoints` function that generates new targets by applying small random offsets to the currently rendered points while computing new colours. The update interval now calls `setTarget(perturbPoints(currentPoints, hue))` rather than `randomPoints(hue)`. Each point therefore moves only a short distance and keeps its index, allowing the existing interpolation to blend colours and positions smoothly.

## Consequences
Gradient updates no longer appear to jump. Cells drift gradually as their colours shift, preserving the smooth transition effect.
