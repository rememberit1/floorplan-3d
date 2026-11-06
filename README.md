# Apartment 3D walkthrough demo

## Overview

Browser **3D floor-plan walkthrough** of a ~963 sq ft 2-bed / 1-bath apartment. You can walk first-person through rooms or switch to a dollhouse orbit view. Built with Three.js on top of a 2D plan image.

## Purpose

Demo / prototype of an interactive listing walkthrough: show spatial layout, finishes, and furniture without a filmed video tour.

## Features

- First-person walk mode (WASD / arrows, Shift to run, pointer-lock look)
- Dollhouse / orbit mode (drag + wheel); toggle with `O` / `Tab` or on-screen button
- Room label HUD; minimap canvas; help overlay (`H` hides)
- Touch joystick + look drag for mobile
- Procedural walls, windows, floors (wood/tile materials), and simple furniture from plan coordinates in `app.js`
- Assets: `plan.png`, screenshot stills (`shot-*.png`), vendored `three.min.js`
- `shell.html` is the lightweight shell; `index.html` is a bundled/inlined build suitable for single-file sharing

## Tech stack

- Three.js (r-era build in `three.min.js`)
- Vanilla JS (`app.js`)
- No build step required for the shell + app pair

## Run / deploy

```bash
python3 -m http.server 8080
# open http://localhost:8080/shell.html
# or the bundled http://localhost:8080/index.html
```

Static hosting only. Pointer lock and some mobile gestures work best over HTTPS in production.

## Notes

Sample apartment geometry for demonstration — not tied to a live MLS listing in this repo.
