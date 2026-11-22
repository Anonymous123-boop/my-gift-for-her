/* =========================================================
   Create a Bouquet — main.js
   Sections: 1 Config · 2 State · 3 Stars · 4 Intro · 5 UI · 6 Flow
   ========================================================= */

/* ---------- 1. Config (edit these freely) ---------- */
const CONFIG = {
  // Song files go in assets/musics/. If yours are not .mp3, change the extension here.
  songs: [
    { title: "꿈",     src: "assets/musics/꿈.mp3" },
    { title: "별빛",   src: "assets/musics/별빛.mp3" },
    { title: "봄눈",   src: "assets/musics/봄눈.mp3" },
    { title: "사랑.",  src: "assets/musics/사랑..mp3" },   // the title has a dot, so the file is 사랑..mp3
    { title: "아름다운", src: "assets/musics/아름다운.mp3" }
  ],
  musicVolume: 0.7,                 // starting volume, 0 to 1
  vinylImage: "assets/icons/vinyl.png",
  // Each added flower picks one of these at random (assets/flowers/). If an image is missing,
  // the code-drawn placeholder flower is used instead.
  flowerImages: [
    "assets/flowers/flower1.png",
    "assets/flowers/flower2.png",
    "assets/flowers/flower3.png",
    "assets/flowers/flower4.png",
    "assets/flowers/flower5.png"
  ],
  starCount: 140,
  intro: { particles: 260, duration: 3000 },
  flowerLimit: 55,
  messageDuration: 3000,   // how long each message stays (ms)
  // The 55 messages: each flower shows one, in random order, with none repeated until all are used.
  messages: [
    "I love your kindness.",
    "I love your intelligence.",
    "I love your humor.",
    "I love how dependable you are.",
    "I love how trustworthy you are.",
    "I love your eyes.",
    "I love your mouth.",
    "I love your nose, especially your nose.",
    "I love your hair.",
    "I love your silliness.",
    "I love your clumsiness.",
    "I love how you understand people.",
    "I love how selfless you are.",
    "I love how observant you are.",
    "I love how neat you are.",
    "I love how responsible you are.",
    "I love your shyness.",
    "I love how much you love animals.",
    "I love how much you love nature.",
    "I love how empathetic you are.",
    "I love how humble you are.",
    "I love how you always try to make me smile.",
    "I love how good of a listener you are.",
    "I love how talented you are.",
    "I love your positive vibes.",
    "I love how clingy you can be.",
    "I love how beautiful you are.",
    "I love how pretty you are.",
    "I love how cute you are.",
    "I love how you always try to see the good in everything.",
    "I love how you always try your best.",
    "I love how you never give up.",
    "I love your mood swings.",
    "I love your attitude.",
    "I love how you sleep.",
    "I love how you make someone's special day feel extra special.",
    "I love how thoughtful you are.",
    "I love the effort you put into everything.",
    "I love how sentimental you are.",
    "I love how you never take anything for granted.",
    "I love how you appreciate everything around you.",
    "I love how lovely you are.",
    "I love how lovable you are.",
    "I love how you always love to the fullest.",
    "I love your style.",
    "I love the way you speak.",
    "I love how respectful you are.",
    "I love how comfortable you are to be with.",
    "I love how fun you are to be around.",
    "I love how light everything feels when I'm with you.",
    "I love how you always try to get along with everyone.",
    "I love how you protect the names of the people you care about.",
    "I love how hardworking you are.",
    "I love your voice.",
    "I love your laugh."
  ],
  flowerColors: ["#ff8fb1", "#ffb3c7", "#ffc98b", "#ffe27a", "#c9a7ff", "#9fd3ff", "#ffffff", "#ff7a7a", "#b5f0c8"],
  secretMessage: "The program has a secret message",   // shown under the bouquet (edit freely)
  letterText:                                           // PLACEHOLDER: replace with your real letter
    "Dear you,\n\n" +
    "This is where your letter will go. It will appear one letter at a time, " +
    "as if someone is writing it by hand, right now, just for you.\n\n" +
    "Replace this text in CONFIG.letterText whenever you are ready.\n\n" +
    "With love,\nMe"
};

/* ---------- 2. State ---------- */
// phases: intro -> start -> adding -> full -> compressed -> letter
const state = { phase: "intro", musicOn: true, song: 0, volume: 0.7 };

const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 3. Living sky: stars, shooting stars, 3D moon, pointer effects ---------- */
const sky = {
  W: 0, H: 0, dpr: 1,
  stars: [], shoots: [], nextShoot: 4,
  px: 0, py: 0,          // smoothed pointer position, -1 to 1
  tx: 0, ty: 0,          // where the pointer (or the idle drift) wants to be
  mx: 0, my: 0,          // raw pointer position in pixels
  lastMove: -99
};

// Procedural moon surface: soft maria (dark patches), craters with bright rims, fine grain.
// Returns an equirectangular brightness map that gets wrapped around the sphere.
function makeMoonTexture() {
  const TW = 512, TH = 256, data = new Float32Array(TW * TH);
  let seed = 20261123;
  const rnd = () => {                                   // small seeded random, so the moon always looks the same
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const layers = [[8, 4, 0.5], [16, 8, 0.25], [32, 16, 0.15], [64, 32, 0.1]].map(([gx, gy, w]) => {
    const a = new Float32Array(gx * gy);
    for (let k = 0; k < a.length; k++) a[k] = rnd();
    return { gx, gy, w, a };
  });
  const smooth = (t) => t * t * (3 - 2 * t);
  function noise(l, u, v) {                              // value noise that wraps left-to-right
    const x = u * l.gx, y = v * (l.gy - 1);
    const x0 = Math.floor(x), y0 = Math.min(Math.floor(y), l.gy - 2);
    const fx = smooth(x - x0), fy = smooth(y - y0);
    const xa = x0 % l.gx, xb = (xa + 1) % l.gx;
    const A = l.a, g = l.gx;
    const top = A[y0 * g + xa] * (1 - fx) + A[y0 * g + xb] * fx;
    const bot = A[(y0 + 1) * g + xa] * (1 - fx) + A[(y0 + 1) * g + xb] * fx;
    return top * (1 - fy) + bot * fy;
  }
  const step = (a, b, x) => smooth(Math.min(Math.max((x - a) / (b - a), 0), 1));

  for (let y = 0; y < TH; y++) {
    for (let x = 0; x < TW; x++) {
      const u = x / TW, v = y / TH;
      let n = 0;
      for (const l of layers) n += noise(l, u, v) * l.w;
      const low = noise(layers[0], u, v) * 0.65 + noise(layers[1], u, v) * 0.35;
      let g = 0.66 + (n - 0.5) * 0.45 - step(0.55, 0.68, low) * 0.26 + (rnd() - 0.5) * 0.04;
      data[y * TW + x] = g;
    }
  }

  // craters
  for (let c = 0; c < 190; c++) {
    const rr = 3 + Math.pow(rnd(), 2.6) * 30;
    const cx = rnd() * TW, cy = TH * (0.12 + rnd() * 0.76);
    const cl = Math.max(0.35, Math.cos((cy / TH - 0.5) * Math.PI));   // squash near the poles
    const rx = Math.ceil((rr / cl) * 1.3), ry = Math.ceil(rr * 1.3);
    for (let py = Math.max(0, Math.floor(cy) - ry); py <= Math.min(TH - 1, Math.floor(cy) + ry); py++) {
      for (let ox = -rx; ox <= rx; ox++) {
        const px = ((Math.floor(cx) + ox) % TW + TW) % TW;
        const dx = (Math.floor(cx) + ox - cx) * cl, dy = py - cy;
        const d = Math.hypot(dx, dy) / rr;
        if (d > 1.3) continue;
        let h = 0;
        if (d < 1) h -= 0.2 * (1 - d * d);                              // darker floor
        h += Math.exp(-(((d - 1) / 0.09) ** 2)) * 0.2;                  // bright rim
        data[py * TW + px] += h;
      }
    }
  }
  for (let k = 0; k < data.length; k++) data[k] = Math.min(Math.max(data[k], 0.12), 1);
  return { TW, TH, data };
}

function startSky() {
  const canvas = $("#stars"), ctx = canvas.getContext("2d");
  const skyEl = $("#sky"), glow = $("#skyGlow"), moonEl = $("#moon");
  const mCanvas = $("#moonCanvas"), mctx = mCanvas.getContext("2d");
  const { TW, TH, data } = makeMoonTexture();
  const S = mCanvas.width;
  const img = mctx.createImageData(S, S);
  const px = img.data;
  moonEl.classList.add("is-3d");

  /* ----- stars ----- */
  const starColors = ["#efe8ff", "#efe8ff", "#efe8ff", "#d6e4ff", "#ffe9c4"];
  function buildStars() {
    const n = Math.round(Math.min(Math.max(CONFIG.starCount * (sky.W * sky.H) / (1280 * 720), 80), 300));
    if (sky.stars.length && Math.abs(sky.stars.length - n) < n * 0.35) return;
    sky.stars = Array.from({ length: n }, () => {
      const depth = 0.25 + Math.random() * 0.75;                 // far = small and slow, near = bigger and faster
      const bigOne = Math.random() < 0.07;
      return {
        x: Math.random() * 1.1 - 0.05, y: Math.random() * 1.1 - 0.05,
        depth, r: 0.5 + depth * 1.0 + (bigOne ? 0.7 : 0), big: bigOne,
        phase: Math.random() * TAU, speed: TAU / (2 + Math.random() * 4),
        c: starColors[(Math.random() * starColors.length) | 0]
      };
    });
  }

  function resize() {
    sky.dpr = Math.min(window.devicePixelRatio || 1, 2);
    sky.W = window.innerWidth; sky.H = window.innerHeight;
    canvas.width = sky.W * sky.dpr; canvas.height = sky.H * sky.dpr;
    ctx.setTransform(sky.dpr, 0, 0, sky.dpr, 0, 0);
    buildStars();
    if (reduceMotion) { drawStars(0); renderMoon(0); }
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, sky.W, sky.H);
    const active = !reduceMotion && t - sky.lastMove < 2.5;
    for (const s of sky.stars) {
      const x = s.x * sky.W + sky.px * s.depth * 26;
      const y = s.y * sky.H + sky.py * s.depth * 16;
      let a, r = s.r;
      if (reduceMotion) a = 0.75;
      else {
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        a = 0.15 + 0.85 * tw * tw;
      }
      if (active) {                                      // stars near the pointer glow brighter
        const d = Math.hypot(x - sky.mx, y - sky.my);
        if (d < 150) { const k = 1 - d / 150; a = Math.min(1, a + k * 0.8); r *= 1 + k * 0.9; }
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      if (s.big && a > 0.6) {                            // little sparkle on the brightest stars
        const L = r * 5 * a;
        ctx.strokeStyle = s.c; ctx.lineWidth = 0.8; ctx.globalAlpha = a * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - L, y); ctx.lineTo(x + L, y);
        ctx.moveTo(x, y - L); ctx.lineTo(x, y + L);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ----- shooting stars ----- */
  function spawnShoot() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const ang = (18 + Math.random() * 22) * Math.PI / 180;
    const sp = 800 + Math.random() * 600;
    sky.shoots.push({
      x: dir > 0 ? Math.random() * sky.W * 0.6 : sky.W * 0.4 + Math.random() * sky.W * 0.6,
      y: Math.random() * sky.H * 0.35 - 10,
      vx: Math.cos(ang) * sp * dir, vy: Math.sin(ang) * sp, sp,
      tail: 140 + Math.random() * 120,
      age: 0, life: 0.9 + Math.random() * 0.6
    });
  }

  function drawShoots(dt) {
    for (let k = sky.shoots.length - 1; k >= 0; k--) {
      const s = sky.shoots[k];
      s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.age > s.life) { sky.shoots.splice(k, 1); continue; }
      const p = s.age / s.life;
      const a = Math.min(s.age / 0.12, 1) * (p > 0.6 ? 1 - (p - 0.6) / 0.4 : 1);
      const ux = s.vx / s.sp, uy = s.vy / s.sp;
      const ex = s.x - ux * s.tail, ey = s.y - uy * s.tail;
      const g = ctx.createLinearGradient(s.x, s.y, ex, ey);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.3, `rgba(214,196,255,${a * 0.45})`);
      g.addColorStop(1, "rgba(180,150,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${a * 0.25})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.1, 0, TAU); ctx.fill();
    }
  }

  /* ----- 3D moon: wraps the texture around a sphere and lights it ----- */
  function texAt(u, v) {
    let x = u * TW - 0.5, y = v * TH - 0.5;
    if (y < 0) y = 0; else if (y > TH - 1.001) y = TH - 1.001;
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const xa = ((x0 % TW) + TW) % TW, xb = (xa + 1) % TW;
    const r0 = y0 * TW, r1 = r0 + TW;
    const top = data[r0 + xa] * (1 - fx) + data[r0 + xb] * fx;
    const bot = data[r1 + xa] * (1 - fx) + data[r1 + xb] * fx;
    return top * (1 - fy) + bot * fy;
  }

  function renderMoon(t) {
    const spin = t * 0.075 + sky.px * 0.5;               // slow rotation, nudged by the pointer
    const tilt = -0.15 + sky.py * 0.3;
    const sA = Math.sin(tilt), cA = Math.cos(tilt), sB = Math.sin(spin), cB = Math.cos(spin);
    let lx = -0.5 + sky.px * 0.6, ly = -0.45 + sky.py * 0.5, lz = 0.75;   // light moves with the pointer
    const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;

    for (let y = 0; y < S; y++) {
      const ny = (y + 0.5) / S * 2 - 1;
      for (let x = 0; x < S; x++) {
        const nx = (x + 0.5) / S * 2 - 1;
        const i = (y * S + x) * 4;
        const r2 = nx * nx + ny * ny;
        if (r2 >= 1) { px[i + 3] = 0; continue; }
        const nz = Math.sqrt(1 - r2);

        const y1 = ny * cA - nz * sA, z1 = ny * sA + nz * cA;       // turn the sphere
        const x2 = nx * cB + z1 * sB, z2 = -nx * sB + z1 * cB;
        const u = Math.atan2(x2, z2) / TAU + 0.5;
        const v = 0.5 + Math.asin(y1 > 1 ? 1 : y1 < -1 ? -1 : y1) / Math.PI;
        const g = texAt(u, v);

        let d = nx * lx + ny * ly + nz * lz; if (d < 0) d = 0;
        const k = (0.08 + 0.92 * Math.pow(d, 0.85)) * (0.72 + 0.28 * nz);   // light + darker edges

        px[i]     = (104 + 151 * g) * k + 26 * (1 - k);    // lavender-white moon, with a dusky dark side
        px[i + 1] = (92 + 158 * g) * k + 20 * (1 - k);
        px[i + 2] = (150 + 105 * g) * k + 52 * (1 - k);
        const edge = (1 - Math.sqrt(r2)) * S * 0.5;         // smooth the rim
        px[i + 3] = edge >= 1 ? 255 : edge * 255;
      }
    }
    mctx.putImageData(img, 0, 0);
  }

  /* ----- pointer ----- */
  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      sky.mx = e.clientX; sky.my = e.clientY;
      sky.tx = (e.clientX / sky.W - 0.5) * 2;
      sky.ty = (e.clientY / sky.H - 0.5) * 2;
      sky.lastMove = performance.now() / 1000;
    }, { passive: true });
    const letGo = () => { sky.lastMove = performance.now() / 1000 - 2.2; };   // fade out soon after leaving / lifting a finger
    window.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") letGo(); });
    window.addEventListener("pointercancel", letGo);
    document.addEventListener("mouseleave", letGo);
  }
  window.addEventListener("resize", resize);

  /* ----- main loop ----- */
  let last = 0, frameNo = 0;
  function frame(now) {
    const t = now / 1000, dt = Math.min(t - last, 0.05); last = t;
    const active = t - sky.lastMove < 2.5;

    if (!active) { sky.tx = Math.sin(t * 0.12) * 0.6; sky.ty = Math.cos(t * 0.09) * 0.4; }   // gentle idle drift
    const k = 1 - Math.exp(-dt * 3);
    sky.px += (sky.tx - sky.px) * k;
    sky.py += (sky.ty - sky.py) * k;

    skyEl.style.setProperty("--gx", (-sky.px * 30).toFixed(1) + "px");
    skyEl.style.setProperty("--gy", (-sky.py * 20).toFixed(1) + "px");
    moonEl.style.transform = `translate3d(${(-sky.px * 10).toFixed(1)}px, ${(-sky.py * 8).toFixed(1)}px, 0)`;

    glow.style.transform = `translate3d(${sky.mx}px, ${sky.my}px, 0)`;
    glow.classList.toggle("on", active);

    if (t > sky.nextShoot && state.phase !== "intro") {
      spawnShoot();
      sky.nextShoot = t + 4 + Math.random() * 6;
    }

    drawStars(t);
    drawShoots(dt);
    if ((frameNo++ & 1) === 0) renderMoon(t);            // the moon updates every other frame
    requestAnimationFrame(frame);
  }

  resize();
  renderMoon(0);
  if (!reduceMotion) requestAnimationFrame(frame);
}

/* ---------- 4. Intro: particles gather into the box ---------- */
function runIntro(onDone) {
  const canvas = $("#intro");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = window.innerWidth, H = window.innerHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  // Targets: points along the rounded outline of the box
  const r = $("#boxBtn").getBoundingClientRect();
  const rad = r.height / 2;
  const straight = Math.max(r.width - r.height, 0);
  const perim = 2 * straight + 2 * Math.PI * rad;

  function pointOnOutline(t) {
    let d = t * perim;
    if (d < straight) return { x: r.left + rad + d, y: r.top };
    d -= straight;
    if (d < Math.PI * rad) {
      const a = -Math.PI / 2 + d / rad;
      return { x: r.right - rad + Math.cos(a) * rad, y: r.top + rad + Math.sin(a) * rad };
    }
    d -= Math.PI * rad;
    if (d < straight) return { x: r.right - rad - d, y: r.bottom };
    d -= straight;
    const a = Math.PI / 2 + d / rad;
    return { x: r.left + rad + Math.cos(a) * rad, y: r.top + rad + Math.sin(a) * rad };
  }

  const colors = ["#f4efff", "#d6c4ff", "#b79cff", "#ffe9b8"];
  const particles = Array.from({ length: CONFIG.intro.particles }, (_, i) => {
    const t = pointOnOutline(i / CONFIG.intro.particles);
    return {
      sx: Math.random() * W, sy: Math.random() * H,
      tx: t.x, ty: t.y,
      delay: Math.random() * 0.35,
      swirl: 40 + Math.random() * 90,
      phase: Math.random() * Math.PI * 2,
      size: 1 + Math.random() * 2,
      color: colors[(Math.random() * colors.length) | 0]
    };
  });

  const total = CONFIG.intro.duration;
  let start = null, finished = false;

  function frame(now) {
    if (start === null) start = now;
    const t = (now - start) / total;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      const k = Math.min(Math.max((t - p.delay) / (1 - p.delay), 0), 1);
      const e = 1 - Math.pow(1 - k, 3);
      const wob = (1 - e) * p.swirl;
      const x = p.sx + (p.tx - p.sx) * e + Math.cos(p.phase + t * 6) * wob * 0.3;
      const y = p.sy + (p.ty - p.sy) * e + Math.sin(p.phase + t * 6) * wob * 0.3;
      ctx.globalAlpha = 0.35 + 0.65 * e;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (t >= 1 && !finished) { finished = true; onDone(); }
    if (t < 1.4) requestAnimationFrame(frame);
    else canvas.remove();
  }
  requestAnimationFrame(frame);
}

function revealUI() {
  $("#boxBtn").classList.add("show");
  $("#songOrb").classList.add("show");
  $("#musicCtrl").classList.add("show");
  $("#intro").classList.add("done");
  state.phase = "start";
}

/* ---------- 5. UI: song orb + music toggle ---------- */
function buildSongList() {
  const list = $("#songList");
  const orb = $("#songOrb");
  CONFIG.songs.forEach((song, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "song-orb__item";
    b.textContent = song.title;
    b.setAttribute("aria-current", i === state.song);
    b.addEventListener("click", () => {
      chooseSong(i);
      list.querySelectorAll(".song-orb__item")
        .forEach((el, j) => el.setAttribute("aria-current", j === i));
    });
    li.appendChild(b);
    list.appendChild(li);
  });
  orb.style.setProperty("--h", `${74 + CONFIG.songs.length * 46}px`);

  const toggle = $("#songToggle");
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = orb.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", (e) => {
    if (!orb.contains(e.target)) {
      orb.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
    }
  });
}

/* ----- Music ----- */
// Browsers block sound until the person taps something, so music starts on the first
// "Create a bouquet" click (or when a song is picked / the music button is pressed).
const audio = new Audio();
audio.preload = "auto";

function setPlaying(on) {
  $("#songOrb").classList.toggle("playing", on);
}

// If the file is not found under the given name, other common extensions are tried
// (.mp3 .m4a .mp4 .wav .ogg .webm) before giving up.
let candidates = [], candIdx = 0, noticeTimer;

function showNotice(text) {
  const n = $("#notice");
  n.textContent = text;
  n.classList.add("visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => n.classList.remove("visible"), 6000);
}

function loadSong(i) {
  state.song = i;
  const src = CONFIG.songs[i].src;
  const base = src.replace(/\.[^./]+$/, "");
  const names = [src, src.replace("..", ".")];     // also try without the doubled dot
  candidates = [...names, ...["mp3", "m4a", "mp4", "wav", "ogg", "webm"].map((e) => `${base}.${e}`)]
    .filter((v, k, a) => a.indexOf(v) === k);
  candIdx = 0;
  audio.src = encodeURI(candidates[0]);
  audio.volume = state.volume;
}

audio.addEventListener("error", () => {
  if (candIdx < candidates.length - 1) {
    candIdx++;
    audio.src = encodeURI(candidates[candIdx]);
    if (state.musicOn) audio.play().then(() => setPlaying(true)).catch(() => {});
  } else {
    console.warn("Song not found or unsupported:", candidates[0]);
    showNotice(`Can't find or play "${candidates[0]}". Check the file name in assets/musics.`);
    setPlaying(false);
  }
});

function playMusic() {
  if (!state.musicOn) return;
  if (!audio.src) loadSong(state.song);
  audio.play().then(() => setPlaying(true)).catch((err) => {
    setPlaying(false);
    if (err && err.name === "NotAllowedError") showNotice("Tap the music button to start the music.");
  });
}

function chooseSong(i) {
  loadSong(i);
  state.musicOn = true;
  syncMusicButton();
  playMusic();
}

audio.addEventListener("ended", () => {
  // keep going: next song, back to the first after the last
  loadSong((state.song + 1) % CONFIG.songs.length);
  document.querySelectorAll(".song-orb__item")
    .forEach((el, j) => el.setAttribute("aria-current", j === state.song));
  playMusic();
});

function syncMusicButton() {
  const btn = $("#musicToggle");
  btn.setAttribute("aria-pressed", state.musicOn);
  btn.setAttribute("aria-label", state.musicOn ? "Turn music off" : "Turn music on");
}

function setupMusicToggle() {
  $("#musicToggle").addEventListener("click", () => {
    state.musicOn = !state.musicOn;
    syncMusicButton();
    if (state.musicOn) playMusic();
    else { audio.pause(); setPlaying(false); }
  });

  // volume slider
  const vol = $("#volume");
  state.volume = CONFIG.musicVolume;
  vol.value = Math.round(state.volume * 100);
  const paint = () => vol.style.setProperty("--v", vol.value + "%");
  paint();
  vol.addEventListener("input", () => {
    state.volume = vol.value / 100;
    audio.volume = state.volume;     // note: iPhones ignore this and use the phone's volume buttons
    paint();
  });
}

/* ----- Image assets ----- */
const loadedFlowers = [];

function preloadAssets() {
  CONFIG.flowerImages.forEach((src) => {
    const img = new Image();
    img.onload = () => loadedFlowers.push(src);
    img.src = src;
  });
  const vinyl = new Image();
  vinyl.onload = () => {
    $(".song-orb__vinyl").src = CONFIG.vinylImage;
    $("#songOrb").classList.add("has-vinyl");
  };
  vinyl.src = CONFIG.vinylImage;
}

/* ---------- 6. Flow ---------- */
function setLabel(text) {
  const label = $("#boxLabel");
  label.classList.add("swap");
  setTimeout(() => { label.textContent = text; label.classList.remove("swap"); }, 350);
}

function onBoxClick() {
  if (state.phase === "start") {
    state.phase = "adding";
    playMusic();
    $("#stage").classList.add("is-bottom");
    setLabel("Add flower");
  } else if (state.phase === "adding") {
    addFlower();
  } else if (state.phase === "full") {
    compressBouquet();
  }
}

/* ---------- 7. Flowers (placeholder SVG, swap for assets/flowers later) ---------- */
const TAU = Math.PI * 2;
const flowers = [];
let rafId = null, lastTime = 0, lastMsg = -1, msgTimer = null;

// Petal shape drawn in code. TO SWAP: replace the markup in flowerMarkup() with <img src="assets/flowers/..."> .
const PETALS = Array.from({ length: 6 }, (_, i) =>
  `<ellipse cx="0" cy="-24" rx="13" ry="22" transform="rotate(${i * 60})"/>`).join("");

function flowerMarkup() {
  if (loadedFlowers.length) {
    const src = loadedFlowers[(Math.random() * loadedFlowers.length) | 0];
    return `<div class="flower__pop"><img class="flower__img" src="${src}" alt="" draggable="false" style="display:block;width:100%;height:100%;object-fit:contain"></div>`;
  }
  // fallback placeholder (used only when the images are not found)
  return `<div class="flower__pop"><svg class="flower__svg" viewBox="-50 -50 100 100" aria-hidden="true">
    <g class="flower__petals">${PETALS}</g>
    <circle r="12" fill="#ffd86b"/><circle r="12" fill="none" stroke="rgba(120,70,0,.25)" stroke-width="2"/>
  </svg></div>`;
}

function flowerSize() {
  return Math.max(40, Math.min(64, window.innerWidth * 0.06));
}

function addFlower() {
  if (flowers.length >= CONFIG.flowerLimit) return;

  const size = flowerSize();
  const el = document.createElement("div");
  el.className = "flower";
  el.style.setProperty("--size", size + "px");
  el.style.setProperty("--c", CONFIG.flowerColors[(Math.random() * CONFIG.flowerColors.length) | 0]);
  el.innerHTML = flowerMarkup();
  $("#flowerLayer").appendChild(el);

  const f = {
    el, size,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    // every new flower shoots out in a different direction (golden-angle spacing)
    angle: (flowers.length * 2.39996 + Math.random() * 0.5) % TAU,
    turn: (Math.random() - 0.5) * 0.8,
    speed: 18 + Math.random() * 40,          // slow drift speed afterwards (px/s)
    burst: 280 + Math.random() * 220,        // extra speed right after popping, fades out
    age: 0
  };

  if (reduceMotion) {
    // no drifting: just scatter and stay put
    f.x = size + Math.random() * (window.innerWidth - size * 2);
    f.y = size + Math.random() * (window.innerHeight * 0.6);
    f.speed = 0;
    f.burst = 0;
  }

  flowers.push(f);
  place(f);
  showMessage();

  if (!rafId) { lastTime = performance.now(); rafId = requestAnimationFrame(tick); }

  if (flowers.length >= CONFIG.flowerLimit) {
    state.phase = "full";
    setLabel("Compress into bouquet");
  }
}

function place(f) {
  f.el.style.transform =
    `translate3d(${f.x - f.size / 2}px, ${f.y - f.size / 2}px, 0) scale(${f.scale || 1})`;
}

function tick(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  const W = window.innerWidth, H = window.innerHeight;
  let allGathered = state.phase === "compressing";

  for (const f of flowers) {
    f.age += dt;

    if (f.g) {
      // ---- gathering into the bouquet ----
      const g = f.g;
      g.t += dt;
      const p = Math.min(Math.max((g.t - g.delay) / g.dur, 0), 1);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
      const swirl = Math.sin(Math.PI * p) * g.amp;
      f.x = g.sx + (g.tx - g.sx) * e + g.px * swirl;
      f.y = g.sy + (g.ty - g.sy) * e + g.py * swirl;
      f.scale = 1 + (g.ts - 1) * e;
      if (p < 1) allGathered = false;
      else {
        // settled: tiny sway so the bouquet feels alive
        f.x = g.tx + Math.sin(now / 1100 + g.sway) * 1.5;
        f.y = g.ty + Math.cos(now / 1300 + g.sway) * 1.5;
      }
      place(f);
      continue;
    }

    // ---- floating around ----
    // pop in place (0.3s), then shoot out in its own direction and slow down into a lazy drift
    const t = f.age - 0.3;
    const sp = t > 0 ? f.speed + f.burst * Math.exp(-t * 2.2) : 0;

    f.angle += f.turn * dt;
    if (Math.random() < dt * 0.5) f.turn = (Math.random() - 0.5) * 1.2;

    f.x += Math.cos(f.angle) * sp * dt;
    f.y += Math.sin(f.angle) * sp * dt;

    const m = f.size / 2 + 6;
    if (f.x < m)     { f.x = m;     f.angle = Math.PI - f.angle; }
    if (f.x > W - m) { f.x = W - m; f.angle = Math.PI - f.angle; }
    if (f.y < m)     { f.y = m;     f.angle = -f.angle; }
    if (f.y > H - m) { f.y = H - m; f.angle = -f.angle; }

    place(f);
  }

  if (allGathered) onCompressed();
  rafId = requestAnimationFrame(tick);
}

/* ---------- 8. Compress into bouquet ---------- */

// Size/position of the bouquet for the current screen.
function isShortLandscape() {
  return window.innerHeight < 480 && window.innerWidth > window.innerHeight * 1.2;
}

function bouquetGeometry() {
  const W = window.innerWidth, H = window.innerHeight;
  if (isShortLandscape()) {
    // phone on its side: bouquet on the left, secret message + envelope on the right
    return { cx: W * 0.36, cy: H * 0.4, R: Math.min(H * 0.22, W * 0.2) };
  }
  return { cx: W / 2, cy: H * 0.36, R: Math.min(W * 0.4, H * 0.25, 180) };
}

// Places the wrapper under the flower head.
function layoutWrapper(geo) {
  const w = $("#wrapper").style;
  w.setProperty("--ww", geo.R * 1.9 + "px");
  w.setProperty("--wh", geo.R * 1.7 + "px");
  w.setProperty("--wy", geo.cy + geo.R * 0.3 + "px");
}

// A dome of n spots (sunflower-style spiral, flattened at the bottom).
function bouquetSpots(n, geo) {
  const spots = [];
  for (let i = 0; i < n; i++) {
    const r = geo.R * Math.sqrt((i + 0.5) / n) * 0.95;
    const a = i * 2.39996;
    let y = Math.sin(a) * r * 0.85;
    const flat = geo.R * 0.3;
    if (y > flat) y = flat + (y - flat) * 0.4;
    spots.push({ x: geo.cx + Math.cos(a) * r, y: geo.cy + y });
  }
  return spots;
}

function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function compressBouquet() {
  state.phase = "compressing";

  // box and message leave
  $("#stage").classList.add("is-hidden");
  $("#message").classList.remove("visible");

  const geo = bouquetGeometry();
  layoutWrapper(geo);
  $("#wrapper").classList.add("show");

  const spots = bouquetSpots(flowers.length, geo);
  const slots = shuffled(flowers.length);      // mixes the colors
  const fs = geo.R * 0.4;                     // final flower size

  flowers.forEach((f, i) => {
    const t = spots[slots[i]];
    const dx = t.x - f.x, dy = t.y - f.y;
    const len = Math.hypot(dx, dy) || 1;
    f.g = {
      slot: slots[i],
      sx: f.x, sy: f.y, tx: t.x, ty: t.y,
      ts: fs / f.size,
      delay: reduceMotion ? 0 : 0.6 + Math.random() * 0.9,  // wrapper shows first
      dur: reduceMotion ? 0.01 : 1.5 + Math.random() * 0.5,
      t: 0,
      px: -dy / len, py: dx / len,                           // sideways direction for the swirl
      amp: reduceMotion ? 0 : (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 120),
      sway: Math.random() * TAU
    };
    f.el.style.zIndex = Math.round(t.y);
  });

  if (!rafId) { lastTime = performance.now(); rafId = requestAnimationFrame(tick); }
}

function onCompressed() {
  if (state.phase !== "compressing") return;
  state.phase = "compressed";
  setTimeout(revealSecret, reduceMotion ? 0 : 900);
}

// Keep the bouquet tidy if the screen resizes or rotates afterwards.
let bouquetResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(bouquetResizeTimer);
  bouquetResizeTimer = setTimeout(() => {
    if (!["compressing", "compressed", "letter"].includes(state.phase)) return;
    const geo = bouquetGeometry();
    layoutWrapper(geo);
    const spots = bouquetSpots(flowers.length, geo);
    const fs = geo.R * 0.4;
    for (const f of flowers) {
      const t = spots[f.g.slot];
      f.g.tx = t.x; f.g.ty = t.y; f.g.ts = fs / f.size;
      if (state.phase !== "compressing") { f.scale = f.g.ts; }
      f.el.style.zIndex = Math.round(t.y);
    }
  }, 150);
});

// Messages come from a shuffled queue, so each one appears once before any repeats.
let messageQueue = [];

function nextMessage() {
  if (!messageQueue.length) {
    messageQueue = CONFIG.messages.map((_, k) => k);
    for (let k = messageQueue.length - 1; k > 0; k--) {          // shuffle
      const r = (Math.random() * (k + 1)) | 0;
      [messageQueue[k], messageQueue[r]] = [messageQueue[r], messageQueue[k]];
    }
    // avoid showing the same message twice in a row across a reshuffle
    if (messageQueue.length > 1 && messageQueue[messageQueue.length - 1] === lastMsg) {
      [messageQueue[0], messageQueue[messageQueue.length - 1]] = [messageQueue[messageQueue.length - 1], messageQueue[0]];
    }
  }
  lastMsg = messageQueue.pop();
  return CONFIG.messages[lastMsg];
}

function showMessage() {
  if (!CONFIG.messages.length) return;
  const msg = $("#message");
  msg.textContent = nextMessage();
  msg.classList.add("visible");
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => msg.classList.remove("visible"), CONFIG.messageDuration);
}

/* ---------- 9. Secret message + letter ---------- */
let letterToken = 0, letterDone = false, letterTimer = null;

function revealSecret() {
  $("#secret").textContent = CONFIG.secretMessage;
  $("#secret").classList.add("visible");
  setTimeout(() => $("#envelope").classList.add("show"), reduceMotion ? 0 : 1500);
}

function openLetter() {
  if (state.phase !== "compressed") return;
  state.phase = "letter";
  $("#envelope").classList.add("opened");
  setTimeout(() => {
    $("#letter").classList.add("open");
    $("#letterClose").focus({ preventScroll: true });
    startLetter();
  }, reduceMotion ? 0 : 450);
}

function closeLetter() {
  if (state.phase !== "letter") return;
  state.phase = "compressed";
  letterToken++;                       // cancels any writing in progress
  clearTimeout(letterTimer);
  $("#letter").classList.remove("open");
  $("#envelope").classList.remove("opened");
  $("#envelope").focus({ preventScroll: true });
}

// How long to wait after each character (a bit random, longer at punctuation)
function writeDelay(ch) {
  let d = 40 + Math.random() * 35;
  if (".!?".includes(ch)) d += 420;
  else if (",;:".includes(ch)) d += 180;
  else if (ch === "\n") d += 320;
  return d;
}

function showWholeLetter() {
  letterToken++;
  clearTimeout(letterTimer);
  $("#letterText").textContent = CONFIG.letterText;
  letterDone = true;
}

function startLetter() {
  if (letterDone) return;              // already written once: leave it as it is
  if (reduceMotion) { showWholeLetter(); return; }

  const box = $("#letterText");
  const scroller = $("#letterScroll");
  const text = CONFIG.letterText;
  const token = ++letterToken;
  let i = 0;

  box.textContent = "";
  const pen = document.createElement("span");   // blinking pen mark at the writing point
  pen.className = "pen";
  box.appendChild(pen);

  (function writeNext() {
    if (token !== letterToken) return;
    if (i >= text.length) { pen.remove(); letterDone = true; return; }
    const ch = text[i++];
    const span = document.createElement("span");
    span.className = "ink";                       // each letter fades in like fresh ink
    span.textContent = ch;
    box.insertBefore(span, pen);
    scroller.scrollTop = scroller.scrollHeight;   // keep the newest line in view
    letterTimer = setTimeout(writeNext, writeDelay(ch));
  })();
}

function setupLetter() {
  $("#envelope").addEventListener("click", openLetter);
  $("#letterClose").addEventListener("click", closeLetter);
  $("#letter").addEventListener("click", (e) => { if (e.target.id === "letter") closeLetter(); });
  $("#letterPaper").addEventListener("click", (e) => {
    // tap the paper while it is being written to finish it instantly
    if (!letterDone && !e.target.closest("#letterClose")) showWholeLetter();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLetter(); });
}

/* ---------- Boot ---------- */
startSky();
preloadAssets();
buildSongList();
setupMusicToggle();
setupLetter();
$("#boxBtn").addEventListener("click", onBoxClick);

if (reduceMotion) revealUI();
else {
  window.addEventListener("load", () => runIntro(revealUI));
  // If the screen rotates or resizes mid-intro, the particle targets are stale: skip ahead cleanly.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (state.phase === "intro") { revealUI(); const c = $("#intro"); if (c) c.remove(); }
    }, 200);
  });
}