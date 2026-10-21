// WebGL layer for the poneglyph portfolio.
// Rust decides the render mode at startup and sets <html data-render="webgl"> when hardware accelerated
// WebGL is available; only then does this module load Three.js. Leptos keeps layout, text and scroll,
// this canvas draws slabs, glyphs and helix behind the DOM.
// Orthographic camera in CSS pixels: one world unit is one CSS pixel, so meshes line up with DOM rects.
//
// Add ?debug to the URL to expose window.__webgl (state and measurement helpers) and ?force=touch,reduce.

const VERSION = 9;
const DEG = Math.PI / 180;
const POINTER_TILT = 4; // CSS degrees at the slab edge nearest the pointer
const NEAREST_HYSTERESIS = 40; // px: stops tilt flicker when the pointer sits between two slabs
const MAX_EDGE_SHIFT = 6; // px: most a slab edge may drift from the flat DOM content through tilt or entry scale
const HELIX_NODES = 48; // 2 strands of 24
const HELIX_PER_STRAND = 24;
const TAIL_NODES = 40; // glyph slots per tail, one tail at each end of a chain
const TAIL_PITCH = 18; // px between tail glyphs before the chaos is added, close to the spacing inside the helix
const TAIL_MIN = 96; // px: least visible tail, the helix body shrinks to make room when a slab sits right at the spacer
const TAIL_OPACITY = 0.5; // starting opacity, close to the strand average so helix and tail read as one chain
const TAIL_EDGE_GAP = 0; // px: centre of the glyph nearest a slab to the visible slab edge, the same at both ends of a chain; 0 lets its drift carry it behind the stone
// Tails sit behind every slab face: a tall slab leans so far that its top edge lies at z = -200 or lower, in front of anything shallower
const TAIL_Z = -600;
const TAIL_FADE = 0.6; // share of the opacity lost by the glyph at the slab edge, so the last glyphs stay readable
const TAIL_JITTER_X = 6; // px: reach of each tail glyph's own chaotic drift
const TAIL_JITTER_Y = 4;
const HELIX_TOTAL = HELIX_NODES + 2 * TAIL_NODES;
const HELIX_STEMS = ['a', 'bv', 'd', 'e', 'f', 'g', 'kqc', 'm', 'n', 'o', 'r', 't', 'x']; // same 13 as the Rust GLYPHS
const T_START = performance.now();
// 30 glyph stems: 20 letters then 10 digits. Single digits live in numbers/, the rest in letters/.
const STEMS = ['a', 'bv', 'd', 'e', 'f', 'g', 'i', 'j', 'kqc', 'l', 'm', 'n', 'o', 'p', 'r', 'szc', 't', 'u', 'x', 'yll',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ATLAS_COLS = 6;
const ATLAS_ROWS = 5;
const SLAB_COLOR_START = '#4a5568'; // shipped overlay grey, so the dark glyph ink stays readable
const SLAB_COLOR_END = '#27333f'; // decoded stone
const SLAB_DEPTH = 56;
const REST_TILT_X = 5; // CSS degrees: slabs lean back slightly so the lit bottom face shows
const ENTRY_TILT_X = 9; // CSS degrees added while a slab enters (matches blockSettle)

const query = new URLSearchParams(location.search);
const DEBUG = query.has('debug');
const WINDOW_FEATHER = 0.09; // armed window: share of the viewport height that re-encodes at each edge
const FORCE = DEBUG ? (query.get('force') || '').split(',') : [];

// Rust publishes the decision before mounting, but this module can run first: wait for it.
waitForRenderMode().then((renderMode) => {
  if (renderMode === 'webgl') main();
});

function waitForRenderMode() {
  const root = document.documentElement;
  return new Promise((resolve) => {
    if (root.dataset.render) return resolve(root.dataset.render);
    const observer = new MutationObserver(() => {
      if (root.dataset.render) {
        observer.disconnect();
        resolve(root.dataset.render);
      }
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-render'] });
  });
}

// Reload once in DOM mode with the notice; Rust treats ?webgl=failed as unsupported.
function fallBackToDom(reason, error) {
  console.warn(`[webgl] ${reason}, falling back to the DOM look`, error);
  const url = new URL(location.href);
  url.searchParams.set('webgl', 'failed');
  location.replace(url);
}

async function main() {
  let THREE;
  let RoundedBoxGeometry;
  try {
    THREE = await import('three');
    ({ RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js'));
  } catch (error) {
    // No import map support (older browsers) or a failed module fetch.
    fallBackToDom('Three.js could not load', error);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    // Rust already tested for a hardware context, so this is rare (context limit, GPU reset).
    fallBackToDom('context failed', error);
    return;
  }

  const canvas = renderer.domElement;
  canvas.id = 'webgl-layer';
  document.body.prepend(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(0x000000, 0);

  const camera = new THREE.OrthographicCamera(0, innerWidth, 0, -innerHeight, 1, 3000);
  camera.position.z = 1000;
  const scene = new THREE.Scene();

  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.right = innerWidth;
    camera.bottom = -innerHeight;
    camera.updateProjectionMatrix();
  });

  // Lights: cool ambient, white key from the top left, faint cyan rim from below.
  scene.add(new THREE.AmbientLight('#6f8aa8', 0.7));
  const key = new THREE.DirectionalLight('#ffffff', 2.4);
  key.position.set(-550, 750, 1000);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#00d4ff', 0.6);
  rim.position.set(0, -1000, 350);
  scene.add(rim);

  const normalMap = makeStoneNormalMap(THREE, renderer);
  const atlases = await buildAtlases(THREE);
  const colorStart = new THREE.Color(SLAB_COLOR_START);
  const colorEnd = new THREE.Color(SLAB_COLOR_END);

  let slabs = [];
  const clusterStart = new WeakMap();
  let chains = [];

  // Armed auto decode: Rust sets <html data-auto> after the first hand decode. Every glyph then computes its
  // own viewport window in the vertex shader from these shared uniforms, so the CPU writes them once a frame.
  const win = {
    uViewport: { value: new THREE.Vector2(0, innerHeight) },
    uFeather: { value: new THREE.Vector2(0, 0) },
    uAuto: { value: 0 },
  };
  const auto = { armed: false, feather: [0, 0] };
  const autoOn = () => auto.armed && !mode.reduced;
  const glyphsShown = (slab) => !slab.decode.radialDone || autoOn();
  const refreshAuto = () => {
    win.uAuto.value = autoOn() ? 1 : 0;
    slabs?.forEach((s) => {
      if (s.glyphs) s.glyphs.visible = glyphsShown(s);
    });
  };
  const readArmed = () => {
    auto.armed = document.documentElement.hasAttribute('data-auto');
    refreshAuto();
  };
  new MutationObserver(readArmed).observe(document.documentElement, { attributes: true, attributeFilter: ['data-auto'] });

  const mqTouch = matchMedia('(hover: none)');
  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mode = { touch: false, reduced: false };
  const refreshMode = () => {
    mode.touch = FORCE.includes('touch') || mqTouch.matches;
    mode.reduced = FORCE.includes('reduce') || mqReduced.matches;
    slabs?.forEach((s) => {
      if (s.glyphs) s.glyphs.material.uniforms.uReduced.value = mode.reduced ? 1 : 0;
    });
    refreshAuto();
  };
  refreshMode();
  readArmed();
  mqTouch.addEventListener('change', refreshMode);
  mqReduced.addEventListener('change', refreshMode);

  // Pointer light: a soft pool of light that follows the pointer over the slabs.
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
  }, { passive: true });
  window.addEventListener('pointerout', (e) => {
    if (e.relatedTarget === null) pointer.seen = false;
  });
  const light = new THREE.PointLight('#bff4ff', 1.1, 900, 0); // decay 0: 1 unit is 1 px, physical falloff would erase it
  light.position.set(pointer.x, -pointer.y, 320);
  light.visible = false;
  scene.add(light);
  const lightState = { x: pointer.x, y: pointer.y };
  let nearest = -1;

  const debug = {
    version: VERSION,
    ready: true,
    mode,
    gl: { renderer: glRendererName(renderer) },
    textures: {
      normal: { width: normalMap.image.width, height: normalMap.image.height, colorSpace: normalMap.colorSpace },
    },
    atlas: { ink: { count: atlases.count }, luminous: { count: atlases.count } },
    slabs: [],
    frames: [],
    cpu: [],
    delayOf: (i, col, row) => decodeDelay(slabs[i], col, row),
    auto,
    maskOf: (i) => slabs[i].mask,
    // JS mirror of the GLSL viewport window: 1 inside, 0 at the viewport edge.
    windowAt: (y) => viewportWindow(y, win.uViewport.value, win.uFeather.value),
    light: { visible: false, x: 0, y: 0, decay: light.decay, distance: light.distance },
    helices: [],
    helixTimeDeg: 0,
    helixNodeAt: (k, n, timeDeg) => helixNodeAt(chains[k].fade, n, timeDeg),
    helixInstanceAt: (k, n) => {
      const mesh = chains[k].mesh;
      const pos = mesh.geometry.getAttribute('aPos');
      const op = mesh.geometry.getAttribute('aOpacity');
      return { x: pos.getX(n), y: -pos.getY(n), opacity: op.getX(n) };
    },
    info: () => ({ ...renderer.info.render }),
    resetFrames: () => {
      debug.frames.length = 0;
      debug.cpu.length = 0;
    },
    slabScreenRect: (i) => slabCorners(slabs[i]),
    slabEdgeZ: (i) => slabEdges(slabs[i]),
    debugTilt: (i, ax, ay = 0) => {
      slabs[i].override = ax === null ? null : { ax, ay };
    },
  };
  Object.defineProperty(debug, 'framesStats', { get: () => stats(debug.frames) });
  Object.defineProperty(debug, 'cpuStats', { get: () => stats(debug.cpu) });
  if (DEBUG) window.__webgl = debug;

  await waitForMount();
  scan();

  // Rescan when sections mount or unmount (easter egg, route changes).
  new MutationObserver((mutations) => {
    const touched = mutations.some((m) =>
      [...m.addedNodes, ...m.removedNodes].some(
        (n) => n.nodeType === 1 && (n.matches?.('.poneglyph-block') || n.querySelector?.('.poneglyph-block')),
      ),
    );
    if (touched) scan();
  }).observe(document.body, { childList: true, subtree: true });

  let last = performance.now();
  let running = false;

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
  });

  start();

  function frame(now) {
    if (document.hidden) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
    const cpuStart = performance.now();

    if (autoOn()) {
      const f = WINDOW_FEATHER * innerHeight;
      auto.feather = [f, f];
      win.uViewport.value.set(0, innerHeight);
      win.uFeather.value.set(f, f);
    }

    // a. read all layout first
    const slabRects = slabs.map((s) => s.wrapper.getBoundingClientRect());
    const chainRects = chains.map((c) => c.el.getBoundingClientRect());

    // b. update meshes from those rects
    const dt = Math.min((now - last) / 1000, 0.1);
    updateLight(dt);
    nearest = pickNearest(slabRects);
    const writes = slabs.map((slab, i) => updateSlab(slab, slabRects[i], i, dt, i === nearest));
    slabs.forEach((slab, i) => updateDecode(slab, now, i));
    const masks = slabs.map((slab, i) => planMask(slab, slabRects[i], i));
    const timeDeg = mode.reduced ? 0 : (((now - T_START) / 10000) * 360) % 360;
    debug.helixTimeDeg = timeDeg;
    chains.forEach((chain, i) => updateChain(chain, chainRects[i], slabRects, timeDeg, mode.reduced ? 0 : (now - T_START) / 1000, i));

    // c. write DOM transforms after every read
    writes.forEach((w, i) => w && writeSlabTransform(slabs[i], w));
    masks.forEach((m, i) => writeMask(slabs[i], m));

    // d. render
    renderer.render(scene, camera);

    debug.cpu.push(performance.now() - cpuStart);
    debug.frames.push(now - last);
    if (debug.frames.length > 600) debug.frames.shift();
    if (debug.cpu.length > 600) debug.cpu.shift();
    last = now;
  }

  function updateLight(dt) {
    const on = pointer.seen && !mode.touch && !mode.reduced;
    light.visible = on;
    const k = 1 - Math.exp(-dt / 0.08);
    lightState.x += (pointer.x - lightState.x) * k;
    lightState.y += (pointer.y - lightState.y) * k;
    light.position.set(lightState.x, -lightState.y, 320);
    Object.assign(debug.light, { visible: on, x: lightState.x, y: lightState.y });
  }

  // Nearest visible slab to the pointer (distance to its rect, 0 inside), with hysteresis so the tilt does not flicker between two slabs.
  function pickNearest(rects) {
    if (!pointer.seen || mode.touch || mode.reduced) return -1;
    const dist = (i) => {
      const r = rects[i];
      const dx = Math.max(r.left - pointer.x, 0, pointer.x - r.right);
      const dy = Math.max(r.top - pointer.y, 0, pointer.y - r.bottom);
      return Math.hypot(dx, dy);
    };
    const visible = rects.map((r) => r.bottom > -100 && r.top < innerHeight + 100);
    let best = -1;
    rects.forEach((_, i) => {
      if (visible[i] && (best < 0 || dist(i) < dist(best))) best = i;
    });
    if (nearest >= 0 && visible[nearest] && best !== nearest && dist(best) + NEAREST_HYSTERESIS > dist(nearest)) {
      return nearest;
    }
    return best;
  }

  function scan() {
    slabs.forEach((s) => {
      scene.remove(s.group);
      s.mesh.geometry.dispose();
      s.material.dispose();
      s.normal.dispose();
      s.observers.forEach((o) => o.disconnect());
      disposeGlyphs(s);
    });

    slabs = [...document.querySelectorAll('.poneglyph-block')].map((block) => {
      const wrapper = block.parentElement; // untransformed: its rect equals the block layout rect
      const button = wrapper.querySelector('.poneglyph-overlay');
      const grid = button?.querySelector('.poneglyph-grid-full') ?? null;
      const group = new THREE.Group();
      scene.add(group);

      const normal = normalMap.clone();
      normal.needsUpdate = true;
      const material = new THREE.MeshStandardMaterial({
        color: '#4a5568',
        roughness: 0.88,
        metalness: 0.05,
        normalMap: normal,
        normalScale: new THREE.Vector2(1.2, 1.2),
      });
      // Armed: the stone goes back to the shipped grey where the glyph window re-encodes it, so the glyphs keep
      // the ink they had before the first tap. Same window as GLYPH_VERTEX, read from the shared uniforms.
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, win, { uEncodedColor: { value: colorStart } });
        shader.vertexShader = shader.vertexShader
          .replace('void main() {', 'varying float vScreenY;\nvoid main() {')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vScreenY = -(modelMatrix * vec4(transformed, 1.0)).y;');
        shader.fragmentShader = shader.fragmentShader
          .replace('void main() {', 'uniform vec2 uViewport;\nuniform vec2 uFeather;\nuniform float uAuto;\nuniform vec3 uEncodedColor;\nvarying float vScreenY;\nvoid main() {')
          .replace('#include <color_fragment>', `#include <color_fragment>
  if (uAuto > 0.5) {
    float w = smoothstep(uViewport.x, uViewport.x + uFeather.x, vScreenY)
      * (1.0 - smoothstep(uViewport.y - uFeather.y, uViewport.y, vScreenY));
    diffuseColor.rgb = mix(uEncodedColor, diffuseColor.rgb, w);
  }`);
      };
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
      mesh.position.z = -SLAB_DEPTH / 2; // front face sits on the DOM plane at z = 0
      group.add(mesh);

      const slab = {
        block, wrapper, button, grid, group, mesh, material, normal,
        size: { w: 0, h: 0 },
        rect: null,
        applied: { ax: NaN, ay: NaN, s: NaN },
        override: null,
        pt: { ax: 0, ay: 0, px: 0, py: 0 }, // smoothed pointer tilt (CSS degrees) and parallax (-1..1)
        // glyph grid and decode state
        glyphs: null,
        rows: [],
        cols: 0,
        gridVersion: 0,
        glyphCount: 0,
        decode: { started: false, pending: false, frames: 0, t0: 0, originCells: null, originPx: null, speed: 1, total: 3, elapsed: 0, radialDone: false, flipped: 0, maxDelay: 0 },
        observers: [],
        cluster: block.closest('.slab-cluster'),
      };

      if (grid && button) {
        const gridObserver = new MutationObserver(() => rebuildGlyphs(slab));
        gridObserver.observe(grid, { attributes: true, attributeFilter: ['data-grid', 'data-cols'] });
        const buttonObserver = new MutationObserver(() => {
          if (!button.classList.contains('decoding') && slab.decode.started) {
            resetDecode(slab); // Rust encoded the slab again (whole-slab mode)
          } else if (button.classList.contains('decoding') && !slab.decode.started) {
            // slabs of one cluster share the first start time
            const now = performance.now();
            const t0 = slab.cluster ? (clusterStart.get(slab.cluster) ?? now) : now;
            if (slab.cluster) clusterStart.set(slab.cluster, t0);
            Object.assign(slab.decode, { started: true, pending: true, frames: 0, t0 });
          }
        });
        buttonObserver.observe(button, { attributes: true, attributeFilter: ['class'] });
        slab.observers.push(gridObserver, buttonObserver);
        rebuildGlyphs(slab);
      }
      return slab;
    });

    debug.slabs = slabs.map(() => ({ rect: null, visible: false }));

    chains.forEach((c) => {
      scene.remove(c.mesh);
      c.mesh.geometry.dispose();
      c.mesh.material.dispose();
    });
    chains = [...document.querySelectorAll('.transition-chain')]
      .map((el) => ({ el, container: el.querySelector('.helix-container[data-helix]') }))
      .filter((c) => c.container)
      .map((c) => {
        const fade = c.container.dataset.fade === '1';
        // slabs of the neighbouring sections: the tails run to the one that covers the chain axis
        const slabsIn = (el) => slabs.flatMap((s, k) => (el && el.contains(s.wrapper) ? [k] : []));
        // per helix and tail glyph: phase and speed for two independent drifts (x, y) and a size factor
        const seeds = Float32Array.from({ length: HELIX_TOTAL * 6 }, Math.random);
        c = { ...c, seeds, prev: slabsIn(c.el.previousElementSibling), next: slabsIn(c.el.nextElementSibling) };
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.copy(new THREE.PlaneGeometry(1, 1));
        geometry.instanceCount = HELIX_TOTAL;
        const atlas = new Float32Array(HELIX_TOTAL);
        const strand = new Float32Array(HELIX_TOTAL);
        for (let n = 0; n < HELIX_TOTAL; n++) {
          atlas[n] = atlases.index[HELIX_STEMS[Math.floor(Math.random() * HELIX_STEMS.length)]];
          // body: strand A then B; tails alternate so the line keeps both colors
          strand[n] = n < HELIX_NODES ? (n < HELIX_PER_STRAND ? 0 : 1) : n % 2;
        }
        const dynamic = (array, size) => new THREE.InstancedBufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('aAtlas', new THREE.InstancedBufferAttribute(atlas, 1));
        geometry.setAttribute('aStrand', new THREE.InstancedBufferAttribute(strand, 1));
        geometry.setAttribute('aPos', dynamic(new Float32Array(HELIX_TOTAL * 3), 3));
        geometry.setAttribute('aSize', dynamic(new Float32Array(HELIX_TOTAL), 1));
        geometry.setAttribute('aOpacity', dynamic(new Float32Array(HELIX_TOTAL), 1));

        const material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uAtlas: { value: atlases.luminous } },
          vertexShader: HELIX_VERTEX,
          fragmentShader: HELIX_FRAGMENT,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        return { ...c, fade, mesh, visible: false };
      });
    debug.helices = chains.map((c) => ({ fade: c.fade, count: HELIX_NODES, visible: false }));
  }

  // One end of a chain: a straight tail of glyphs on the chain axis that runs to the slab edge covering the axis
  // and fades out before it. Returns the visible tail length and how far the helix body must pull in to make room.
  function tailPlan(chain, rect, slabRects, side) {
    const cx = rect.left + rect.width / 2;
    const rects = (side < 0 ? chain.prev : chain.next).map((k) => slabRects[k]);
    if (!rects.length) return null;
    const covering = rects.filter((r) => r.left <= cx && cx <= r.right);
    let edge;
    if (covering.length) {
      edge = side < 0 ? Math.max(...covering.map((r) => r.bottom)) : Math.min(...covering.map((r) => r.top));
    } else {
      const dist = (r) => (cx < r.left ? r.left - cx : cx - r.right);
      const near = rects.reduce((a, b) => (dist(b) < dist(a) ? b : a));
      edge = side < 0 ? near.bottom : near.top;
    }
    const gap = Math.max(0, side < 0 ? rect.top - edge : edge - rect.bottom);
    const cap = TAIL_NODES * TAIL_PITCH;
    const len = Math.min(Math.max(TAIL_MIN, gap), cap);
    return { len, inset: Math.max(0, len - gap) };
  }

  function updateChain(chain, rect, slabRects, timeDeg, tSec, i) {
    const top = tailPlan(chain, rect, slabRects, -1);
    const bottom = tailPlan(chain, rect, slabRects, 1);
    const bodyTop = rect.top + (top?.inset ?? 0);
    const bodyH = rect.height - (top?.inset ?? 0) - (bottom?.inset ?? 0);
    const visible = bodyTop + bodyH + (bottom?.len ?? 0) > -100 && bodyTop - (top?.len ?? 0) < innerHeight + 100;
    chain.mesh.visible = visible;
    debug.helices[i] = { fade: chain.fade, count: HELIX_NODES, tails: [top?.len ?? 0, bottom?.len ?? 0], visible };
    if (!visible) return;

    const pos = chain.mesh.geometry.getAttribute('aPos');
    const size = chain.mesh.geometry.getAttribute('aSize');
    const opacity = chain.mesh.geometry.getAttribute('aOpacity');
    const cx = rect.left + rect.width / 2;
    for (let n = 0; n < HELIX_NODES; n++) {
      const node = helixNodeAt(chain.fade, n, timeDeg);
      const [dx, dy] = chaosAt(chain, n, tSec);
      pos.setXYZ(n, cx + node.xOffset + dx, -(bodyTop + (node.yPct / 100) * bodyH + dy), node.z);
      size.setX(n, 28 * node.scale * (96 / 56)); // the 96 px glowing cell keeps a 28 px glyph
      opacity.setX(n, node.opacity);
    }
    // Tails: slots 0..TAIL_NODES-1 hang above the body, the next TAIL_NODES below it. z sits behind the whole slab (TAIL_Z).
    [top, bottom].forEach((plan, side) => {
      for (let k = 0; k < TAIL_NODES; k++) {
        const n = HELIX_NODES + side * TAIL_NODES + k;
        // one glyph more than fits at TAIL_PITCH, minus the one next to the helix. The glyph nearest the slab is pinned
        // TAIL_EDGE_GAP from its visible edge, the rest spread evenly back to where the first one used to sit. The
        // chain start (side 0) meets the lit bottom face of a slab that leans back, which shows below its DOM rect.
        const count = plan ? Math.ceil(plan.len / TAIL_PITCH) : 0;
        if (!plan || k === 0 || k >= count) {
          opacity.setX(n, 0);
          continue;
        }
        const near = plan.len - TAIL_EDGE_GAP - (side === 0 ? SLAB_DEPTH * Math.sin(REST_TILT_X * DEG) : 0);
        const far = (2 * plan.len) / (count + 1);
        const u = count > 2 ? far + ((k - 1) * (near - far)) / (count - 2) : near;
        // each glyph drifts on its own two slow sine pairs, so no gap stays fixed, not even the one next to the body
        const [dx, dy] = chaosAt(chain, n, tSec);
        const y = (side === 0 ? bodyTop - u : bodyTop + bodyH + u) + dy;
        const f = clamp((u - 0.3 * plan.len) / (0.7 * plan.len), 0, 1);
        pos.setXYZ(n, cx + dx, -y, TAIL_Z);
        size.setX(n, 28 * (0.6 + s0(chain, n * 6 + 4) * 0.25) * (96 / 56));
        opacity.setX(n, TAIL_OPACITY * (1 - TAIL_FADE * f * f * (3 - 2 * f)));
      }
    });
    pos.needsUpdate = true;
    size.needsUpdate = true;
    opacity.needsUpdate = true;
  }

  function disposeGlyphs(slab) {
    if (!slab.glyphs) return;
    slab.group.remove(slab.glyphs);
    slab.glyphs.geometry.dispose();
    slab.glyphs.material.dispose();
    slab.glyphs = null;
  }

  // Parse data-grid into one instanced quad per non-empty cell. Cell pitch comes from the real grid
  // rect (columns are floor(width / 32) wide, rows at least 32 high), delays still use the Rust 32 px.
  function rebuildGlyphs(slab) {
    const { grid } = slab;
    const raw = grid?.dataset.grid;
    if (!raw) return;
    disposeGlyphs(slab);
    slab.rows = raw.split(';').map((r) => r.split(','));
    slab.cols = Number(grid.dataset.cols) || slab.rows[0].length;
    slab.gridVersion += 1;

    const rect = grid.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const cellW = W / slab.cols;
    const cellH = Math.max(32, H / slab.rows.length);
    const glyph = Math.min(32, cellW, cellH);

    const offsets = [];
    const atlasIdx = [];
    const delays = [];
    slab.cells = [];
    slab.rows.forEach((row, r) => {
      row.forEach((stem, c) => {
        const idx = atlases.index[stem];
        if (idx === undefined) return;
        offsets.push(-W / 2 + (c + 0.5) * cellW, H / 2 - (r + 0.5) * cellH);
        atlasIdx.push(idx);
        delays.push(0);
        slab.cells.push([c, r]);
      });
    });
    slab.glyphCount = atlasIdx.length;

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.copy(new THREE.PlaneGeometry(1, 1));
    geometry.instanceCount = atlasIdx.length;
    geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 2));
    geometry.setAttribute('aAtlas', new THREE.InstancedBufferAttribute(new Float32Array(atlasIdx), 1));
    geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(new Float32Array(delays), 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uAtlas: { value: atlases.ink },
        uGlyph: { value: (glyph * 64) / 56 }, // the 56 px drawing sits inside a 64 px atlas cell
        uElapsed: { value: slab.decode.started && !slab.decode.pending ? slab.decode.elapsed : -1 },
        uSpeed: { value: slab.decode.speed },
        uReduced: { value: mode.reduced ? 1 : 0 },
        ...win, // shared by reference: one write per frame serves every slab
      },
      vertexShader: GLYPH_VERTEX,
      fragmentShader: GLYPH_FRAGMENT,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false; // positions come from attributes, so the default bounds are wrong
    mesh.position.z = 1;
    mesh.visible = glyphsShown(slab);
    slab.glyphs = mesh;
    slab.group.add(mesh);
    if (slab.decode.started && !slab.decode.pending) uploadDelays(slab);
  }

  // Back to the encoded look: grey stone, every glyph drawn, no decode in flight.
  function resetDecode(slab) {
    Object.assign(slab.decode, { started: false, pending: false, radialDone: false, elapsed: 0, flipped: 0, maxDelay: 0 });
    slab.material.color.copy(colorStart);
    if (slab.glyphs) {
      slab.glyphs.material.uniforms.uElapsed.value = -1;
      slab.glyphs.visible = true;
    }
  }

  function uploadDelays(slab) {
    const attr = slab.glyphs.geometry.getAttribute('aDelay');
    let max = 0;
    slab.cells.forEach(([c, r], n) => {
      const d = decodeDelay(slab, c, r);
      attr.array[n] = d;
      if (d > max) max = d;
    });
    attr.needsUpdate = true;
    slab.decode.maxDelay = max;
  }

  // Same formula as Rust's --decode-delay times 0.04 s times the speed factor.
  function decodeDelay(slab, col, row) {
    if (auto.armed && mode.reduced) return 0; // whole-slab fade once armed
    const o = slab.decode.originCells ?? [slab.cols / 2, slab.rows.length / 2];
    return Math.hypot(col - o[0], row - o[1]) * 0.04 * slab.decode.speed;
  }

  function updateDecode(slab, now, i) {
    const d = slab.decode;
    const info = { glyphCount: slab.glyphCount, gridVersion: slab.gridVersion, glyphVisible: !!slab.glyphs?.visible };

    if (d.started && d.pending) {
      d.frames += 1;
      const raw = slab.grid.dataset.origin;
      if (raw || d.frames >= 3) {
        if (!raw) console.warn('[webgl] origin fallback');
        const [ox, oy] = raw ? raw.split(',').map(Number) : [slab.cols * 16, slab.rows.length * 16];
        d.originPx = [ox, oy];
        d.originCells = [ox / 32, oy / 32];
        d.speed = parseFloat(slab.button.style.getPropertyValue('--decode-speed')) || 1;
        d.total = parseFloat(slab.button.style.getPropertyValue('--decode-total')) || 3;
        d.pending = false;
        if (slab.glyphs) {
          slab.glyphs.material.uniforms.uSpeed.value = d.speed;
          uploadDelays(slab);
        }
      }
    }

    if (d.started && !d.pending && !d.radialDone) {
      d.elapsed = (now - d.t0) / 1000;
      if (slab.glyphs) {
        slab.glyphs.material.uniforms.uElapsed.value = d.elapsed;
        const delays = slab.glyphs.geometry.getAttribute('aDelay').array;
        let flipped = 0;
        for (let n = 0; n < delays.length; n++) {
          if ((d.elapsed - delays[n]) / (0.6 * d.speed) >= 0.55) flipped++;
        }
        d.flipped = delays.length ? flipped / delays.length : 0;
      }
      const t = clamp(d.elapsed / d.total, 0, 1);
      slab.material.color.lerpColors(colorStart, colorEnd, t * t);
      if (d.elapsed > d.maxDelay + 0.6 * d.speed) {
        d.radialDone = true;
        if (slab.glyphs) {
          slab.glyphs.visible = glyphsShown(slab);
        }
      }
    }

    debug.slabs[i] = {
      ...debug.slabs[i],
      ...info,
      glyphVisible: !!slab.glyphs?.visible,
      decode: {
        started: d.started,
        t0: d.t0,
        origin: d.originPx,
        speed: d.speed,
        total: d.total,
        elapsed: d.elapsed,
        done: d.radialDone,
        radialDone: d.radialDone,
        flippedFraction: d.flipped,
      },
    };
  }

  // Block text follows the glyph window: transparent over the encoded band, opaque once the glyphs have
  // dissolved. Stops are px in the block's own box (CSS has no fixed mask attachment), so they derive from the
  // untransformed wrapper rect. Returns the stops to write, `false` to clear, or null to leave as is.
  function planMask(slab, rect, i) {
    const visible = rect.bottom > -100 && rect.top < innerHeight + 100;
    if (!autoOn()) return slab.mask ? false : null;
    if (!visible) {
      slab.mask = null; // rewrite unconditionally when the slab comes back into view
      return null;
    }
    const [ft, fb] = auto.feather;
    // Text appears only once the glyphs have dissolved (window = 1 at the feather end), fading in over the next
    // 40% of the feather, so no line is ever drawn under a glyph.
    const a = ft * 0.9 - rect.top;
    const b = ft * 1.4 - rect.top;
    const c = innerHeight - fb * 1.4 - rect.top;
    const d = innerHeight - fb * 0.9 - rect.top;
    const next = [a, b, c, d];
    const prev = slab.mask;
    if (prev && next.every((v, k) => Math.abs(v - prev[k]) < 0.5)) return null;
    debug.slabs[i] = { ...debug.slabs[i], mask: next };
    return next;
  }

  function writeMask(slab, stops) {
    if (stops === null) return;
    const names = ['--auto-a', '--auto-b', '--auto-c', '--auto-d'];
    if (stops === false) {
      names.forEach((n) => slab.block.style.removeProperty(n));
      slab.mask = null;
      return;
    }
    names.forEach((n, k) => slab.block.style.setProperty(n, `${stops[k].toFixed(1)}px`));
    slab.mask = stops;
  }

  // Returns the DOM transform to write (or null) so every read happens before any write.
  function updateSlab(slab, rect, i, dt, isNearest) {
    const visible = rect.bottom > -100 && rect.top < innerHeight + 100;
    slab.group.visible = visible;
    slab.rect = rect;
    if (!visible) {
      debug.slabs[i] = { ...debug.slabs[i], visible, rect: rectOf(rect) };
      return null;
    }

    // Rebuild the slab geometry only when the layout size really changed.
    if (Math.abs(rect.width - slab.size.w) > 0.5 || Math.abs(rect.height - slab.size.h) > 0.5) {
      slab.size = { w: rect.width, h: rect.height };
      slab.mesh.geometry.dispose();
      slab.mesh.geometry = new RoundedBoxGeometry(rect.width, rect.height, SLAB_DEPTH, 4, 10);
      slab.normal.repeat.set(rect.width / 512, rect.height / 512);
    }

    slab.group.position.set(rect.left + rect.width / 2, -(rect.top + rect.height / 2), 0);

    // Entry progress mirrors the shipped blockSettle (animation-range: entry 0% to entry 70%).
    const e = clamp((innerHeight - rect.top) / Math.min(rect.height, innerHeight) / 0.7, 0, 1);
    let ax = mode.reduced ? 0 : REST_TILT_X + ENTRY_TILT_X * (1 - e);
    let ay = 0;
    let s = mode.reduced ? 1 : 1600 / (1600 + 60 * (1 - e));
    // Pointer tilt: the nearest slab turns toward the pointer (the edge nearest it recedes).
    const usePointer = isNearest && !mode.touch && !mode.reduced;
    const nx = usePointer ? clamp((pointer.x - (rect.left + rect.width / 2)) / (rect.width / 2), -1, 1) : 0;
    const ny = usePointer ? clamp((pointer.y - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1) : 0;
    const k = 1 - Math.exp(-dt / 0.12);
    const pt = slab.pt;
    pt.ay += (POINTER_TILT * nx - pt.ay) * k;
    pt.ax += (-POINTER_TILT * ny - pt.ax) * k;
    pt.px += (nx - pt.px) * k;
    pt.py += (ny - pt.py) * k;

    if (slab.override) {
      ax = slab.override.ax;
      ay = slab.override.ay;
    } else if (!mode.reduced) {
      ax += pt.ax;
      ay += pt.ay;
      // The DOM content stays flat, so a tall slab that leans or shrinks about its center would slide its edges
      // away from the content. Cap the edge shift at MAX_EDGE_SHIFT px, shared by the tilt and the scale: short
      // slabs keep the full effect.
      const minCosX = clamp(1 - MAX_EDGE_SHIFT / rect.height, -1, 1);
      const minCosY = clamp(1 - MAX_EDGE_SHIFT / rect.width, -1, 1);
      const maxAx = Math.acos(minCosX) / DEG;
      const maxAy = Math.acos(minCosY) / DEG;
      ax = clamp(ax, -maxAx, maxAx);
      ay = clamp(ay, -maxAy, maxAy);
      s = Math.max(s, clamp(minCosX, 0, 1));
    }

    slab.group.rotation.set(-ax * DEG, ay * DEG, 0);
    slab.group.scale.setScalar(s);

    debug.slabs[i] = { ...debug.slabs[i], visible, rect: rectOf(rect), entry: e, tiltX: ax, tiltY: ay, scale: s, parallax: { px: pt.px, py: pt.py }, nearest: isNearest };
    return { ax, ay, s, px: pt.px, py: pt.py };
  }

  function writeSlabTransform(slab, { ax, ay, s, px, py }) {
    const a = slab.applied;
    if (Math.abs(a.ax - ax) >= 0.01 || Math.abs(a.ay - ay) >= 0.01 || Math.abs(a.s - s) >= 0.0005) {
      slab.applied = { ...slab.applied, ax, ay, s };
      slab.block.style.transform = mode.reduced ? '' : `rotateX(${ax}deg) rotateY(${ay}deg) scale(${s})`;
    }

    // Parallax variables for the cards inside the nearest slab; removed once the slab relaxes.
    const quiet = mode.reduced || mode.touch || (Math.abs(px) < 0.002 && Math.abs(py) < 0.002);
    if (quiet) {
      if (slab.parallaxOn) {
        slab.block.style.removeProperty('--px');
        slab.block.style.removeProperty('--py');
        slab.parallaxOn = false;
      }
    } else if (!slab.parallaxOn || Math.abs((slab.applied.px ?? 0) - px) > 0.002 || Math.abs((slab.applied.py ?? 0) - py) > 0.002) {
      slab.block.style.setProperty('--px', px.toFixed(3));
      slab.block.style.setProperty('--py', py.toFixed(3));
      slab.applied.px = px;
      slab.applied.py = py;
      slab.parallaxOn = true;
    }
  }

  function slabCorners(slab) {
    slab.group.updateMatrixWorld(true);
    const { w, h } = slab.size;
    const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2], [w / 2, h / 2]].map(([x, y]) =>
      slab.group.localToWorld(new THREE.Vector3(x, y, 0)),
    );
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => -p.y);
    return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
  }

  function slabEdges(slab) {
    slab.group.updateMatrixWorld(true);
    const { w, h } = slab.size;
    const z = (x, y) => slab.group.localToWorld(new THREE.Vector3(x, y, 0)).z;
    return { top: z(0, h / 2), bottom: z(0, -h / 2), left: z(-w / 2, 0), right: z(w / 2, 0) };
  }

  function waitForMount() {
    const ready = () =>
      document.querySelectorAll('.poneglyph-block').length >= 5 &&
      document.querySelectorAll('.transition-chain').length >= 5;
    return new Promise((resolve) => {
      if (ready()) return resolve();
      const observer = new MutationObserver(() => {
        if (ready()) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 15000);
    });
  }
}

// Port of generate_helix_nodes (transition_section.rs) plus the helix CSS in main.css.
function helixNodeAt(fade, n, timeDeg) {
  const strand = n < HELIX_PER_STRAND ? 0 : 1;
  const i = n % HELIX_PER_STRAND;
  const tRaw = i / (HELIX_PER_STRAND - 1);
  const t = fade ? tRaw ** 1.5 : tRaw;
  const base = t * 720 + (strand ? 200 : 0);
  const taper = Math.sin(t * Math.PI);
  const angle = (base + timeDeg) * DEG;
  const depth = (Math.cos(angle) + 1) / 2;
  const mask = t <= 0.1 ? 1 : 1 - (t - 0.1) / 0.9; // replaces the DOM mask-image on .transition-chain-fade
  return {
    xOffset: Math.sin(angle) * (strand ? 68 : 80) * taper,
    yPct: t * 100,
    scale: 0.45 + depth * 0.7,
    z: Math.cos(angle) * 60,
    opacity: (strand ? 0.15 + depth * 0.5 : 0.2 + depth * 0.6) * (fade ? mask : 1),
  };
}

const HELIX_VERTEX = /* glsl */ `
  attribute float aAtlas;
  attribute float aStrand;
  attribute vec3 aPos;
  attribute float aSize;
  attribute float aOpacity;
  varying vec2 vUv;
  varying float vStrand;
  varying float vOpacity;

  void main() {
    float col = mod(aAtlas, ${ATLAS_COLS}.0);
    float row = floor(aAtlas / ${ATLAS_COLS}.0);
    vUv = vec2((col + uv.x) / ${ATLAS_COLS}.0, (${ATLAS_ROWS - 1}.0 - row + uv.y) / ${ATLAS_ROWS}.0);
    vStrand = aStrand;
    vOpacity = aOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aPos + vec3(position.xy * aSize, 0.0), 1.0);
  }
`;

const HELIX_FRAGMENT = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying float vStrand;
  varying float vOpacity;

  void main() {
    vec4 tex = texture2D(uAtlas, vUv);
    vec3 tint = vStrand < 0.5 ? vec3(0.0, 0.83, 1.0) : vec3(0.376, 0.647, 0.98);
    vec3 rgb = mix(tint, vec3(1.0), smoothstep(0.55, 1.0, tex.a) * 0.75);
    gl_FragColor = vec4(rgb, tex.a * vOpacity);
    #include <colorspace_fragment>
  }
`;

const GLYPH_VERTEX = /* glsl */ `
  attribute vec2 aOffset;
  attribute float aAtlas;
  attribute float aDelay;
  uniform float uGlyph;
  uniform float uElapsed;
  uniform float uSpeed;
  uniform float uReduced;
  uniform vec2 uViewport;
  uniform vec2 uFeather;
  uniform float uAuto;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vFlash;

  void main() {
    // uElapsed < 0 means the decode has not started: every cell sits at p = 0.
    float p = uElapsed < 0.0 ? 0.0 : clamp((uElapsed - aDelay) / (0.6 * uSpeed), 0.0, 1.0);
    if (uAuto > 0.5) {
      // Armed: the radial decode still plays, then each glyph follows its own screen row.
      float y = -(modelMatrix * vec4(aOffset, 0.0, 1.0)).y;
      float w = smoothstep(uViewport.x, uViewport.x + uFeather.x, y)
        * (1.0 - smoothstep(uViewport.y - uFeather.y, uViewport.y, y));
      p = min(p, w);
    }
    float q = p < 0.55 ? pow(p / 0.55, 2.0) : 1.0;
    bool reduced = uReduced > 0.5;
    float angle = reduced ? 0.0 : q * 1.5707963;
    vAlpha = reduced ? 1.0 - p : (p < 0.55 ? 1.0 : 1.0 - (p - 0.55) / 0.45);
    vFlash = reduced ? 0.0 : q;

    vec2 local = position.xy * uGlyph;
    float z = -local.x * sin(angle);
    local.x *= cos(angle);

    float col = mod(aAtlas, ${ATLAS_COLS}.0);
    float row = floor(aAtlas / ${ATLAS_COLS}.0);
    vUv = vec2((col + uv.x) / ${ATLAS_COLS}.0, (${ATLAS_ROWS - 1}.0 - row + uv.y) / ${ATLAS_ROWS}.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(aOffset + local, z), 1.0);
  }
`;

const GLYPH_FRAGMENT = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vFlash;

  void main() {
    vec4 tex = texture2D(uAtlas, vUv);
    vec3 cyan = vec3(0.0, 0.83, 1.0);
    vec3 rgb = mix(tex.rgb, cyan, 0.6 * vFlash) * (1.0 + 0.8 * vFlash);
    gl_FragColor = vec4(rgb, tex.a * vAlpha);
    #include <colorspace_fragment>
  }
`;

// Two 6 by 5 atlases of the 30 glyph SVGs: dark ink for slab glyphs, white glowing silhouettes for the helix.
async function buildAtlases(THREE) {
  const images = await Promise.all(
    STEMS.map(async (stem) => {
      const folder = /^\d$/.test(stem) ? 'numbers' : 'letters';
      const img = new Image();
      img.src = `/symbols/svg/${folder}/${stem}.svg`;
      await img.decode();
      return img;
    }),
  );

  const contain = (img, box) => {
    const k = Math.min(box / (img.naturalWidth || box), box / (img.naturalHeight || box));
    const w = (img.naturalWidth || box) * k;
    const h = (img.naturalHeight || box) * k;
    return { w, h };
  };

  const inkCell = 64;
  const ink = document.createElement('canvas');
  ink.width = ATLAS_COLS * inkCell;
  ink.height = ATLAS_ROWS * inkCell;
  const inkCtx = ink.getContext('2d');

  const glowCell = 96;
  const glow = document.createElement('canvas');
  glow.width = ATLAS_COLS * glowCell;
  glow.height = ATLAS_ROWS * glowCell;
  const glowCtx = glow.getContext('2d');
  const scratch = document.createElement('canvas');
  scratch.width = scratch.height = glowCell;
  const scratchCtx = scratch.getContext('2d');

  const index = {};
  images.forEach((img, n) => {
    index[STEMS[n]] = n;
    const col = n % ATLAS_COLS;
    const row = Math.floor(n / ATLAS_COLS);

    const a = contain(img, 56);
    inkCtx.drawImage(img, col * inkCell + (inkCell - a.w) / 2, row * inkCell + (inkCell - a.h) / 2, a.w, a.h);

    scratchCtx.clearRect(0, 0, glowCell, glowCell);
    scratchCtx.globalCompositeOperation = 'source-over';
    scratchCtx.drawImage(img, (glowCell - a.w) / 2, (glowCell - a.h) / 2, a.w, a.h);
    scratchCtx.globalCompositeOperation = 'source-in';
    scratchCtx.fillStyle = '#ffffff';
    scratchCtx.fillRect(0, 0, glowCell, glowCell);
    glowCtx.save();
    glowCtx.shadowColor = 'rgba(255, 255, 255, 0.85)';
    glowCtx.shadowBlur = 14;
    glowCtx.drawImage(scratch, col * glowCell, row * glowCell);
    glowCtx.drawImage(scratch, col * glowCell, row * glowCell);
    glowCtx.restore();
  });

  const make = (canvas) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace; // atlases are color data, unlike the normal map
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  };

  return { ink: make(ink), luminous: make(glow), index, count: images.length };
}

function rectOf(r) {
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function viewportWindow(y, viewport, feather) {
  const step = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  return step(viewport.x, viewport.x + feather.x, y) * (1 - step(viewport.y - feather.y, viewport.y, y));
}

// Each glyph drifts on its own two slow sine pairs, so no gap stays fixed. Returns [dx, dy] in px.
function chaosAt(chain, n, tSec) {
  const b = n * 6;
  const drift = (a, c) => (Math.sin(tSec * (0.5 + chain.seeds[b + a] * 0.9) + chain.seeds[b + c] * 6.28)
    + 0.5 * Math.sin(tSec * (1.1 + chain.seeds[b + c] * 1.3) + chain.seeds[b + a] * 6.28)) / 1.5;
  return [drift(0, 1) * TAIL_JITTER_X, drift(2, 3) * TAIL_JITTER_Y];
}

function s0(chain, i) {
  return chain.seeds[i];
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function stats(list) {
  const f = list.slice(5).sort((a, b) => a - b);
  if (!f.length) return { avg: 0, p95: 0, worst: 0, n: 0 };
  const avg = f.reduce((a, b) => a + b, 0) / f.length;
  return { avg, p95: f[Math.floor(f.length * 0.95)], worst: f[f.length - 1], n: f.length };
}

function glRendererName(renderer) {
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  } catch {
    return 'unknown';
  }
}

// Tileable stone height field (fBm value noise + cracks) turned into a tangent-space normal map.
function makeStoneNormalMap(THREE, renderer) {
  const size = 512;
  const rand = mulberry32(1337);
  const height = new Float32Array(size * size);

  for (let octave = 0; octave < 4; octave++) {
    const cells = 8 * 2 ** octave;
    const lattice = Float32Array.from({ length: cells * cells }, () => rand());
    const amp = 0.5 ** octave;
    for (let y = 0; y < size; y++) {
      const fy = (y / size) * cells;
      const y0 = Math.floor(fy);
      const ty = smooth(fy - y0);
      for (let x = 0; x < size; x++) {
        const fx = (x / size) * cells;
        const x0 = Math.floor(fx);
        const tx = smooth(fx - x0);
        const at = (cx, cy) => lattice[(cy % cells) * cells + (cx % cells)];
        const top = at(x0, y0) * (1 - tx) + at(x0 + 1, y0) * tx;
        const bottom = at(x0, y0 + 1) * (1 - tx) + at(x0 + 1, y0 + 1) * tx;
        height[y * size + x] += (top * (1 - ty) + bottom * ty) * amp;
      }
    }
  }

  // A handful of thin cracks cut into the height field.
  // Few, short and nearly straight so the 512 px tile does not read as a repeat.
  for (let c = 0; c < 3; c++) {
    let x = rand() * size;
    let y = rand() * size;
    let angle = rand() * Math.PI * 2;
    const steps = 40 + Math.floor(rand() * 50);
    for (let s = 0; s < steps; s++) {
      angle += (rand() - 0.5) * 0.25;
      x += Math.cos(angle) * 2;
      y += Math.sin(angle) * 2;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const px = (Math.floor(x) + dx + size) % size;
          const py = (Math.floor(y) + dy + size) % size;
          height[py * size + px] -= dx === 0 && dy === 0 ? 0.22 : 0.08;
        }
      }
    }
  }

  const strength = 2.5;
  const data = new Uint8ClampedArray(size * size * 4);
  const h = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y - 1) + 2 * h(x + 1, y) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x - 1, y) + h(x - 1, y + 1));
      const dy = (h(x - 1, y + 1) + 2 * h(x, y + 1) + h(x + 1, y + 1)) - (h(x - 1, y - 1) + 2 * h(x, y - 1) + h(x + 1, y - 1));
      const nx = -dx * strength;
      const ny = dy * strength;
      const inv = 1 / Math.hypot(nx, ny, 1);
      const o = (y * size + x) * 4;
      data[o] = (nx * inv * 0.5 + 0.5) * 255;
      data[o + 1] = (ny * inv * 0.5 + 0.5) * 255;
      data[o + 2] = (inv * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  canvas.getContext('2d').putImageData(new ImageData(data, size, size), 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture; // colorSpace stays at the default: normals are data, not color
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
