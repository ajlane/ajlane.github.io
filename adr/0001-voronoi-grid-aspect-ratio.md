# ADR 0001: Voronoi grid respects display aspect ratio

## Status
Accepted

## Context
The Voronoi background uses a grid of points with equal counts in the x and y axes. When the display aspect ratio differs from 1:1 this produces cells that appear stretched, particularly on tall screens.

## Decision
Calculate the number of sample points along each axis based on the canvas aspect ratio. The larger dimension scales up while the smaller scales down so that point spacing remains roughly even.

## Consequences
Voronoi cells retain consistent proportions on both landscape and portrait displays without significantly changing the total number of points rendered.
