# Vendored Three.js

Pinned copy of [three.js](https://threejs.org) 0.170.0, MIT licensed (the license header is kept inside `three.module.min.js`). It is loaded only when the page runs in WebGL mode, through the import map in `frontend/index.html`.

| File | Source | SHA-256 |
| ---- | ------ | ------- |
| `three.module.min.js` | `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js` | `08fd7545d13d2c7fb65ab691530a802dafefd638596501854f267d0fb13c39e7` |
| `addons/geometries/RoundedBoxGeometry.js` | `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/geometries/RoundedBoxGeometry.js` | `d20aeaf7077c459a8d952d215738d7b44fba028440bb862d84b622a34f0c80bb` |

## Updating

Download the same two files for the new version, replace both here, update the table above, and re-check the slab, glyph decode and helix in the browser. The import map maps the bare specifier `three` to `three.module.min.js` and `three/addons/` to `addons/`.
