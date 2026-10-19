// WebGL layer for the poneglyph portfolio.
// Rust decides the render mode at startup and sets <html data-render="webgl"> when hardware accelerated
// WebGL is available; only then does this module load Three.js. Leptos keeps layout, text and scroll,
// this canvas draws slabs, glyphs and helix behind the DOM.
// Orthographic camera in CSS pixels: one world unit is one CSS pixel, so meshes line up with DOM rects.
//
// Add ?debug to the URL to expose window.__webgl (state and measurement helpers) and ?force=touch,reduce.

const VERSION = 5;
const DEG = Math.PI / 180;
const POINTER_TILT = 4; // CSS degrees at the slab edge nearest the pointer
const NEAREST_HYSTERESIS = 40; // px: stops tilt flicker when the pointer sits between two slabs
const HELIX_NODES = 48; // 2 strands of 24
const HELIX_PER_STRAND = 24;
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
  let chains = [];

  const mqTouch = matchMedia('(hover: none)');
  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mode = { touch: false, reduced: false };
  const refreshMode = () => {
    mode.touch = FORCE.includes('touch') || mqTouch.matches;
    mode.reduced = FORCE.includes('reduce') || mqReduced.matches;
    slabs?.forEach((s) => {
      if (s.glyphs) s.glyphs.material.uniforms.uReduced.value = mode.reduced ? 1 : 0;
    });
  };
  refreshMode();
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

    // a. read all layout first
    const slabRects = slabs.map((s) => s.wrapper.getBoundingClientRect());
    const chainRects = chains.map((c) => c.el.getBoundingClientRect());

    // b. update meshes from those rects
    const dt = Math.min((now - last) / 1000, 0.1);
    updateLight(dt);
    nearest = pickNearest(slabRects);
    const writes = slabs.map((slab, i) => updateSlab(slab, slabRects[i], i, dt, i === nearest));
    slabs.forEach((slab, i) => updateDecode(slab, now, i));
    const timeDeg = mode.reduced ? 0 : (((now - T_START) / 10000) * 360) % 360;
    debug.helixTimeDeg = timeDeg;
    chains.forEach((chain, i) => updateChain(chain, chainRects[i], timeDeg, i));

    // c. write DOM transforms after every read
    writes.forEach((w, i) => w && writeSlabTransform(slabs[i], w));

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

  // Nearest visible slab to the pointer, with hysteresis so the tilt does not flicker between two slabs.
  function pickNearest(rects) {
    if (!pointer.seen || mode.touch || mode.reduced) return -1;
    const dist = (i) => {
      const r = rects[i];
      return Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2));
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
        decode: { started: false, pending: false, frames: 0, t0: 0, originCells: null, originPx: null, speed: 1, total: 3, elapsed: 0, done: false, flipped: 0, maxDelay: 0 },
        observers: [],
      };

      if (grid && button) {
        const gridObserver = new MutationObserver(() => rebuildGlyphs(slab));
        gridObserver.observe(grid, { attributes: true, attributeFilter: ['data-grid', 'data-cols'] });
        const buttonObserver = new MutationObserver(() => {
          if (button.classList.contains('decoding') && !slab.decode.started) {
            Object.assign(slab.decode, { started: true, pending: true, frames: 0, t0: performance.now() });
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
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.copy(new THREE.PlaneGeometry(1, 1));
        geometry.instanceCount = HELIX_NODES;
        const atlas = new Float32Array(HELIX_NODES);
        const strand = new Float32Array(HELIX_NODES);
        for (let n = 0; n < HELIX_NODES; n++) {
          atlas[n] = atlases.index[HELIX_STEMS[Math.floor(Math.random() * HELIX_STEMS.length)]];
          strand[n] = n < HELIX_PER_STRAND ? 0 : 1;
        }
        const dynamic = (array, size) => new THREE.InstancedBufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('aAtlas', new THREE.InstancedBufferAttribute(atlas, 1));
        geometry.setAttribute('aStrand', new THREE.InstancedBufferAttribute(strand, 1));
        geometry.setAttribute('aPos', dynamic(new Float32Array(HELIX_NODES * 3), 3));
        geometry.setAttribute('aSize', dynamic(new Float32Array(HELIX_NODES), 1));
        geometry.setAttribute('aOpacity', dynamic(new Float32Array(HELIX_NODES), 1));

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

  function updateChain(chain, rect, timeDeg, i) {
    const visible = rect.bottom > -100 && rect.top < innerHeight + 100;
    chain.mesh.visible = visible;
    debug.helices[i] = { fade: chain.fade, count: HELIX_NODES, visible };
    if (!visible) return;

    const pos = chain.mesh.geometry.getAttribute('aPos');
    const size = chain.mesh.geometry.getAttribute('aSize');
    const opacity = chain.mesh.geometry.getAttribute('aOpacity');
    const cx = rect.left + rect.width / 2;
    for (let n = 0; n < HELIX_NODES; n++) {
      const node = helixNodeAt(chain.fade, n, timeDeg);
      pos.setXYZ(n, cx + node.xOffset, -(rect.top + (node.yPct / 100) * rect.height), node.z);
      size.setX(n, 28 * node.scale * (96 / 56)); // the 96 px glowing cell keeps a 28 px glyph
      opacity.setX(n, node.opacity);
    }
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
        uElapsed: { value: -1 },
        uSpeed: { value: slab.decode.speed },
        uReduced: { value: mode.reduced ? 1 : 0 },
      },
      vertexShader: GLYPH_VERTEX,
      fragmentShader: GLYPH_FRAGMENT,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false; // positions come from attributes, so the default bounds are wrong
    mesh.position.z = 1;
    mesh.visible = !slab.decode.done;
    slab.glyphs = mesh;
    slab.group.add(mesh);
    if (slab.decode.started && !slab.decode.pending) uploadDelays(slab);
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

    if (d.started && !d.pending && !d.done) {
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
        d.done = true;
        if (slab.glyphs) slab.glyphs.visible = false;
      }
    }

    debug.slabs[i] = {
      ...debug.slabs[i],
      ...info,
      glyphVisible: !!slab.glyphs?.visible,
      decode: {
        started: d.started,
        origin: d.originPx,
        speed: d.speed,
        total: d.total,
        elapsed: d.elapsed,
        done: d.done,
        flippedFraction: d.flipped,
      },
    };
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
  varying vec2 vUv;
  varying float vAlpha;
  varying float vFlash;

  void main() {
    // uElapsed < 0 means the decode has not started: every cell sits at p = 0.
    float p = uElapsed < 0.0 ? 0.0 : clamp((uElapsed - aDelay) / (0.6 * uSpeed), 0.0, 1.0);
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
