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
  // Image cards for the finale: put pictures in assets/cards/ and list them here.
  // While this list is empty (or a file is missing) soft colored placeholder cards are shown.
  cardImages: [],          // e.g. ["assets/cards/card1.jpg", "assets/cards/card2.jpg"]
  // After the card wall starts scrolling
  finaleScrollWaitMs: 3000,        // how long the cards scroll before the messages start
  finaleMessageMs: 3000,           // how long each message stays on screen
  finaleMessages: [                // PLACEHOLDERS: replace these, and add as many more as you like
    "Finale message one",
    "Finale message two",
    "Finale message three",
    "Finale message four",
    "Finale message five"
  ],
  giftMessage: "Merry Christmas! Open it.",
  docTitle: "Our Memories",
  docText: "Every picture, every moment, saved in one place.",
  docButton: "Click this to download our memories",
  memoriesFile: "",                // PLACEHOLDER: path of the real file to download, e.g. "assets/our-memories.zip". Empty = a small placeholder text file
  memoriesLabel: "Open me",          // small line printed on the letter's paper
  videoFile: "",                   // PLACEHOLDER: path of your mp4, e.g. "assets/our-video.mp4". Empty = the tape shows a reminder instead of downloading
  videoTitle: "Our Video",         // written on the tape's label
  videoButton: "Click the tape to download our video",
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

/* ---------- 3. Sky: twinkling stars, shooting stars, gentle hover twinkle ---------- */
const sky = {
  W: 0, H: 0,
  stars: [], shoots: [], nextShoot: 4,
  mx: -999, my: -999, moved: false      // last pointer position, and whether it moved since the last frame
};

function startSky() {
  const canvas = $("#stars"), ctx = canvas.getContext("2d");
  const starColors = ["#efe8ff", "#efe8ff", "#efe8ff", "#d6e4ff", "#ffe9c4"];

  function buildStars() {
    const n = Math.round(Math.min(Math.max(CONFIG.starCount * (sky.W * sky.H) / (1280 * 720), 70), 260));
    if (sky.stars.length && Math.abs(sky.stars.length - n) < n * 0.35) return;
    sky.stars = Array.from({ length: n }, () => {
      const big = Math.random() < 0.07;
      return {
        x: Math.random(), y: Math.random(),
        r: 0.6 + Math.random() * 1.1 + (big ? 0.7 : 0), big,
        phase: Math.random() * TAU,
        speed: TAU / (2 + Math.random() * 4),      // each star twinkles at its own pace
        pulse: 0,                                  // extra twinkle when the pointer passes nearby
        c: starColors[(Math.random() * starColors.length) | 0]
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sky.W = window.innerWidth; sky.H = window.innerHeight;
    canvas.width = sky.W * dpr; canvas.height = sky.H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (reduceMotion) drawStars(0, 0);
  }

  function drawStars(t, dt) {
    ctx.clearRect(0, 0, sky.W, sky.H);
    const R2 = 120 * 120;
    for (const s of sky.stars) {
      const x = s.x * sky.W, y = s.y * sky.H;

      // pointer moving nearby: a few stars catch a little extra twinkle
      if (sky.moved && s.pulse < 0.25) {
        const dx = x - sky.mx, dy = y - sky.my;
        if (dx * dx + dy * dy < R2 && Math.random() < 0.3) s.pulse = 0.7 + Math.random() * 0.3;
      }

      let a, r = s.r;
      if (reduceMotion) a = 0.75;
      else {
        const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        a = 0.15 + 0.85 * tw * tw;
      }
      if (s.pulse > 0.01) {
        const flick = 0.55 + 0.45 * Math.sin(t * 16 + s.phase);
        a = Math.min(1, a + s.pulse * 0.8 * flick);
        r *= 1 + s.pulse * 0.7;
        s.pulse *= Math.exp(-dt * 2.4);                // fades out in about a second
      }

      ctx.globalAlpha = a;
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();

      if ((s.big && a > 0.6) || s.pulse > 0.35) {      // little sparkle cross
        const L = r * 5 * a;
        ctx.strokeStyle = s.c; ctx.lineWidth = 0.8; ctx.globalAlpha = a * 0.6;
        ctx.beginPath();
        ctx.moveTo(x - L, y); ctx.lineTo(x + L, y);
        ctx.moveTo(x, y - L); ctx.lineTo(x, y + L);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    sky.moved = false;
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

  /* ----- pointer: only used to wake up nearby stars ----- */
  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      sky.mx = e.clientX; sky.my = e.clientY; sky.moved = true;
    }, { passive: true });
  }
  window.addEventListener("resize", resize);

  /* ----- main loop ----- */
  let last = 0;
  function frame(now) {
    if (sky.paused) return;                     // the white finale hides the sky, so stop drawing it
    const t = now / 1000, dt = Math.min(t - last, 0.05); last = t;

    if (t > sky.nextShoot && state.phase !== "intro") {
      spawnShoot();
      sky.nextShoot = t + 4 + Math.random() * 6;
    }

    drawStars(t, dt);
    drawShoots(dt);
    requestAnimationFrame(frame);
  }

  resize();
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
const cardOK = [];                 // image cards that loaded, kept in the order of CONFIG.cardImages

function preloadAssets() {
  CONFIG.flowerImages.forEach((src) => {
    const img = new Image();
    img.onload = () => loadedFlowers.push(src);
    img.src = src;
  });
  CONFIG.cardImages.forEach((src, i) => {
    const img = new Image();
    img.onload = () => { cardOK[i] = src; };
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
  revealDoneButton();
}

function startLetter() {
  if (letterDone) { revealDoneButton(); return; }   // already written once: leave it as it is
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
    if (i >= text.length) { pen.remove(); letterDone = true; revealDoneButton(); return; }
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
  $("#letterDone").addEventListener("click", letterFinale);
  $("#letter").addEventListener("click", (e) => { if (e.target.id === "letter") closeLetter(); });
  $("#letterPaper").addEventListener("click", (e) => {
    // tap the paper while it is being written to finish it instantly
    if (!letterDone && !e.target.closest("#letterDone")) showWholeLetter();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLetter(); });
}

/* ---------- 10. Finale: letter rolls up and explodes, white screen, image cards ---------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Web Animations helper: runs the animation, keeps its end state, resolves when finished
function play(el, frames, opts) {
  const a = el.animate(frames, { fill: "forwards", ...opts });
  return a.finished.catch(() => {});
}

function revealDoneButton() {
  const b = $("#letterDone");
  if (b.classList.contains("show")) return;
  b.classList.add("show");
  const sc = $("#letterScroll");
  sc.scrollTo({ top: sc.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
}

async function letterFinale() {
  if (state.phase !== "letter") return;
  state.phase = "rolling";

  const paper = $("#letterPaper"), roll = $("#letterRoll"), btn = $("#letterDone");
  btn.disabled = true;

  // Keep the phone free for the animation: freeze the night scene and drop the heavy effects
  document.body.classList.add("finale");
  pauseBackground();
  $("#letter").classList.add("is-rolling");
  paper.classList.add("rolling");

  const r = paper.getBoundingClientRect();
  const ox = r.left + r.width / 2, oy = r.top + r.height / 2;      // where the explosion happens

  if (!reduceMotion) {
    play(btn, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    play(roll, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    setTimeout(() => { $("#letterScroll").style.visibility = "hidden"; }, 320);   // the text is covered by now, so stop drawing it

    // 1. roll up sideways into a thin scroll (one move)
    await play(paper, [
      { transform: "rotate(0deg) scale(1, 1)" },
      { transform: "rotate(0deg) scale(0.09, 0.6)" }
    ], { duration: 800, easing: "cubic-bezier(0.65, 0, 0.35, 1)" });

    // 2. wiggle, shaking a bit more each time
    await play(paper, [
      { transform: "rotate(0deg) scale(0.09, 0.6)" },
      { transform: "rotate(-9deg) scale(0.095, 0.6)" },
      { transform: "rotate(9deg) scale(0.1, 0.62)" },
      { transform: "rotate(-6deg) scale(0.105, 0.62)" },
      { transform: "rotate(0deg) scale(0.11, 0.64)" }
    ], { duration: 700, easing: "ease-in-out" });
  }

  // 3. explode: flash to white and send paper bits flying
  setTimeout(() => document.body.classList.add("is-white"), reduceMotion ? 0 : 200);
  play($("#whiteout"), [{ opacity: 0 }, { opacity: 1 }], { duration: reduceMotion ? 1 : 420, delay: reduceMotion ? 0 : 40, easing: "ease-out" });
  if (!reduceMotion) {
    startConfetti(ox, oy);
    await play(paper, [
      { transform: "rotate(0deg) scale(0.11, 0.64)", opacity: 1 },
      { transform: "rotate(0deg) scale(0.3, 1)", opacity: 1, offset: 0.4 },
      { transform: "rotate(0deg) scale(1.2, 1.6)", opacity: 0 }
    ], { duration: 280, easing: "ease-out" });
    await sleep(150);
  } else await sleep(60);

  $("#letter").classList.remove("open");
  document.body.classList.add("bg-off");
  await sleep(reduceMotion ? 100 : 700);
  showFloatingCard();
}

// stop everything that draws the night scene (saves battery on phones)
function pauseBackground() {
  sky.paused = true;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}

/* ----- falling paper bits ----- */
function startConfetti(ox, oy) {
  const cv = $("#confetti"), cx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const W = window.innerWidth, H = window.innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const small = W < 600;                          // fewer, simpler paper bits on phones
  const colors = ["#fbf4e6", "#f3e7ff", "#ffe4ee", "#e6f0ff", "#fff1c9"];
  const bits = [];
  const make = (x, y, vx, vy) => ({
    x, y, vx, vy,
    w: 7 + Math.random() * 10, h: 6 + Math.random() * 8,
    rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 8,
    flip: Math.random() * TAU, vf: 3 + Math.random() * 5,
    sway: Math.random() * TAU,
    lines: small ? 0 : 1 + ((Math.random() * 3) | 0),
    c: colors[(Math.random() * colors.length) | 0]
  });

  const burst = small ? 36 : 80;
  for (let i = 0; i < burst; i++) {
    const a = Math.random() * TAU, sp = 250 + Math.random() * 750;
    bits.push(make(ox, oy, Math.cos(a) * sp, Math.sin(a) * sp - 150));
  }

  const rainUntil = performance.now() + 6000;       // a soft rain of paper keeps falling for a few seconds
  let last = performance.now();

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    const t = now / 1000;
    cx.clearRect(0, 0, W, H);

    if (now < rainUntil && Math.random() < dt * (small ? 4 : 8)) {
      bits.push(make(Math.random() * W, -20, (Math.random() - 0.5) * 40, 60 + Math.random() * 80));
    }

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i];
      b.vx *= Math.exp(-dt * 1.4);
      b.vy += 260 * dt;
      b.vy *= Math.exp(-dt * 1.1);                   // paper drifts down slowly
      b.x += (b.vx + Math.sin(t * 2 + b.sway) * 40) * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt; b.flip += b.vf * dt;
      if (b.y > H + 30) { bits.splice(i, 1); continue; }

      cx.save();
      cx.translate(b.x, b.y);
      cx.rotate(b.rot);
      cx.scale(1, Math.cos(b.flip));                 // flutter
      cx.fillStyle = b.c;
      cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      cx.strokeStyle = "rgba(110, 80, 160, 0.4)";
      cx.lineWidth = 0.8;
      cx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
      cx.beginPath();
      for (let l = 1; l <= b.lines; l++) {            // little lines of handwriting
        const y = -b.h / 2 + (l * b.h) / (b.lines + 1);
        cx.moveTo(-b.w / 2 + 2, y); cx.lineTo(b.w / 2 - 2, y);
      }
      cx.stroke();
      cx.restore();
    }

    if (bits.length || now < rainUntil) requestAnimationFrame(loop);
    else cx.clearRect(0, 0, W, H);
  }
  requestAnimationFrame(loop);
}

/* ----- image cards ----- */
const CARD_COLORS = [
  ["#ffb3c7", "#c9a7ff"], ["#ffe27a", "#ffb38a"], ["#9fd3ff", "#b9a7ff"], ["#b5f0c8", "#9fd3ff"],
  ["#ff9fb1", "#ffd27a"], ["#d6c4ff", "#ffc9e0"], ["#ffcf9f", "#ff8fb1"], ["#a7e3ff", "#d6c4ff"]
];

function cardPool() { return cardOK.filter(Boolean); }
function poolSize() { return cardPool().length || CARD_COLORS.length; }

function cardMetrics() {
  const W = window.innerWidth, H = window.innerHeight;
  const cw = Math.round(Math.max(96, Math.min(190, W * 0.2)));
  const ch = Math.round(cw * 1.25), gap = 12;
  const stepX = cw + gap, stepY = ch + gap;
  return {
    W, H, cw, ch, stepX, stepY,
    side: Math.ceil((W / 2 - cw / 2) / stepX) + 1,     // columns on each side of the middle
    rc: Math.ceil(H / 2 / stepY) + 1                   // rows above and below the middle
  };
}

function makeCard(idx, m) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.width = m.cw + "px";
  el.style.height = m.ch + "px";
  const pool = cardPool();
  if (pool.length) {
    el.style.backgroundImage = `url("${encodeURI(pool[idx % pool.length])}")`;
  } else {
    const [c1, c2] = CARD_COLORS[idx % CARD_COLORS.length];     // placeholder until real pictures are added
    el.style.background =
      `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.55), transparent 55%), linear-gradient(150deg, ${c1}, ${c2})`;
  }
  return el;
}

const easeOutBack = (p) => 1 + 2.70158 * Math.pow(p - 1, 3) + 1.70158 * Math.pow(p - 1, 2);

function showFloatingCard() {
  state.phase = "card";
  const m0 = cardMetrics();
  const layer = $("#cardLayer");
  const card = makeCard(0, m0);
  card.classList.add("card--float", "ready");
  layer.appendChild(card);

  let running = true, cur = { x: m0.W / 2, y: m0.H / 2, rot: 0, s: 0 };
  const t0 = performance.now();
  const put = (c) => {
    card.style.transform =
      `translate3d(${c.x - m0.cw / 2}px, ${c.y - m0.ch / 2}px, 0) rotate(${c.rot}deg) scale(${c.s})`;
  };

  // pops in, then floats around the middle in a little circle
  function orbit(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    const ap = Math.min(t / 0.7, 1);
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const R = Math.max(26, Math.min(window.innerWidth, window.innerHeight) * 0.07) * ap;
    const th = reduceMotion ? 0 : t * 1.1;
    cur = {
      x: cx + Math.cos(th) * R,
      y: cy + Math.sin(th) * R * 0.7,
      rot: reduceMotion ? 0 : Math.sin(th) * 7,
      s: (1.25 + (reduceMotion ? 0 : 0.03 * Math.sin(t * 2.2))) * easeOutBack(ap)
    };
    put(cur);
    requestAnimationFrame(orbit);
  }
  requestAnimationFrame(orbit);

  card.addEventListener("click", () => {
    if (state.phase !== "card") return;
    running = false;
    pressCard(card, m0, cur);
  }, { once: true });
}

// pressed: the card slides into the middle like a puzzle piece, then the wall fills in around it
async function pressCard(card, m, cur) {
  state.phase = "fitting";
  card.classList.remove("ready");
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

  const slot = document.createElement("div");
  slot.className = "slot";
  slot.style.width = m.cw + "px"; slot.style.height = m.ch + "px";
  slot.style.transform = `translate3d(${cx - m.cw / 2}px, ${cy - m.ch / 2}px, 0)`;
  card.parentNode.insertBefore(slot, card);
  play(slot, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });

  const from = `translate3d(${cur.x - m.cw / 2}px, ${cur.y - m.ch / 2}px, 0) rotate(${cur.rot}deg) scale(${cur.s})`;
  const to = `translate3d(${cx - m.cw / 2}px, ${cy - m.ch / 2}px, 0)`;
  await play(card, reduceMotion ? [{ transform: `${to} rotate(0deg) scale(1)` }] : [
    { transform: from },
    { transform: `${to} rotate(-5deg) scale(1.14)`, offset: 0.6 },
    { transform: `${to} rotate(2deg) scale(0.95)`, offset: 0.82 },
    { transform: `${to} rotate(0deg) scale(1)` }
  ], { duration: reduceMotion ? 1 : 800, easing: "cubic-bezier(0.4, 0, 0.2, 1)" });

  card.classList.add("snapped");                      // little ring when it clicks into place
  play(slot, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });

  await sleep(reduceMotion ? 0 : 350);
  const wait = buildWall(!reduceMotion);
  await sleep(wait * 1000);

  // screen is full: start the scrolling and hand the middle over to the wall's own card
  $("#wall").classList.add("scrolling");
  card.remove(); slot.remove();
  state.phase = "wall";
  finaleSequence();
}

// Builds columns of cards. Each column holds two identical copies stacked, so it can scroll forever.
// Returns how many seconds the fade-in takes.
function buildWall(animate) {
  const m = cardMetrics();
  const wall = $("#wall");
  wall.textContent = "";
  wall.classList.remove("scrolling");

  const N = 2 * m.rc + 1;                       // rows per copy
  const travel = N * m.stepY;
  const pool = poolSize();

  for (let k = -m.side; k <= m.side; k++) {
    const col = document.createElement("div");
    col.className = "wall__col";
    col.style.left = (m.W / 2 - m.cw / 2 + k * m.stepX) + "px";
    col.style.width = m.cw + "px";

    const strip = document.createElement("div");
    strip.className = "wall__strip " + (k % 2 === 0 ? "up" : "down");   // neighbors scroll in opposite directions
    strip.style.top = (m.H / 2 - m.ch / 2 - m.rc * m.stepY) + "px";
    const speed = 26 + (((k * 37) % 17) + 17) % 17 * 1.6;              // px per second, a little different per column
    strip.style.setProperty("--travel", travel + "px");
    strip.style.setProperty("--dur", (travel / speed) + "s");

    for (let copy = 0; copy < 2; copy++) {
      for (let r = 0; r < N; r++) {
        const isCenter = k === 0 && r === m.rc;
        const card = makeCard(isCenter ? 0 : ((k + m.side) * 3 + r * 5 + 1) % pool, m);
        card.style.top = ((copy * N + r) * m.stepY) + "px";
        if (animate && !isCenter) {
          const ring = Math.max(Math.abs(k), Math.abs(r - m.rc));        // fades in ring by ring, outward from the middle
          card.style.setProperty("--delay", (ring * 0.23 + Math.random() * 0.08) + "s");
          card.classList.add("fade-in");
        }
        strip.appendChild(card);
      }
    }
    col.appendChild(strip);
    wall.appendChild(col);
  }
  return animate ? Math.max(m.side, m.rc) * 0.23 + 0.75 : 0;
}

// keep the wall filling the screen if the window changes size
let wallResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(wallResizeTimer);
  wallResizeTimer = setTimeout(() => {
    if (state.phase !== "wall" && state.phase !== "messages") return;
    buildWall(false);
    $("#wall").classList.add("scrolling");
  }, 200);
});

/* ---------- 11. After the wall: messages, cards gather into a gift, the file ---------- */
async function finaleSequence() {
  await sleep(CONFIG.finaleScrollWaitMs);
  if (state.phase !== "wall") return;
  await showFinaleMessages();
  await gatherIntoGift();
}

// messages appear one by one in the middle; the wall is dimmed so they are easy to read
async function showFinaleMessages() {
  const list = CONFIG.finaleMessages.filter(Boolean);
  if (!list.length) return;
  state.phase = "messages";
  const dim = $("#dim"), msg = $("#finaleMsg");

  await play(dim, [{ opacity: 0 }, { opacity: 1 }], { duration: reduceMotion ? 1 : 800 });
  for (const text of list) {
    msg.textContent = text;
    msg.classList.remove("hide");
    msg.classList.add("show");
    await sleep(Math.max(CONFIG.finaleMessageMs - 600, 600));   // each message takes about 3 seconds in total
    msg.classList.remove("show");
    msg.classList.add("hide");
    await sleep(600);
  }
  msg.classList.remove("hide");
  await play(dim, [{ opacity: 1 }, { opacity: 0 }], { duration: reduceMotion ? 1 : 1000 });   // the screen lightens again
}

// every card on screen flies into the middle, then the gift pops up
async function gatherIntoGift() {
  state.phase = "gathering";
  const wall = $("#wall"), layer = $("#gatherLayer");
  const W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2;

  const clones = [];
  const frag = document.createDocumentFragment();
  for (const c of wall.querySelectorAll(".card")) {
    const r = c.getBoundingClientRect();
    if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;     // only cards you can see
    const el = c.cloneNode(false);
    el.className = "card gather-card";
    el.style.top = "0px"; el.style.left = "0px";
    el.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
    frag.appendChild(el);
    clones.push({ el, r });
  }
  layer.appendChild(frag);
  wall.classList.remove("scrolling");
  wall.textContent = "";                                                      // same frame: the wall is replaced by the copies

  if (reduceMotion) { layer.textContent = ""; showGift(); return; }

  const maxD = Math.hypot(cx, cy);
  for (const { el, r } of clones) {
    const x0 = r.left, y0 = r.top;
    const mx = cx - r.width / 2, my = cy - r.height / 2;
    const dx = mx - x0, dy = my - y0, len = Math.hypot(dx, dy) || 1;
    const sw = (Math.random() < 0.5 ? -1 : 1) * Math.min(len * 0.35, 160);   // swirl a little on the way
    const midX = x0 + dx * 0.5 + (-dy / len) * sw, midY = y0 + dy * 0.5 + (dx / len) * sw;
    const rot = (Math.random() - 0.5) * 50;
    play(el, [
      { transform: `translate3d(${x0}px, ${y0}px, 0) rotate(0deg) scale(1)`, opacity: 1 },
      { transform: `translate3d(${midX}px, ${midY}px, 0) rotate(${rot * 0.5}deg) scale(0.7)`, opacity: 1, offset: 0.55 },
      { transform: `translate3d(${mx}px, ${my}px, 0) rotate(${rot}deg) scale(0.22)`, opacity: 0 }
    ], { duration: 900, delay: (1 - len / maxD) * 350 + Math.random() * 80, easing: "cubic-bezier(0.5, 0, 0.3, 1)" });
  }

  await sleep(1050);
  showGift();
  await sleep(500);
  layer.textContent = "";
}

function showGift() {
  state.phase = "gift";
  $("#giftNote").textContent = CONFIG.giftMessage;
  $("#giftLayer").classList.add("show");
  $("#gift").classList.add("in");
  $("#giftNote").classList.add("in");
}

// opening: the lid flies off, sparkles burst out, and the file pops out of the gift
async function openGift() {
  if (state.phase !== "gift") return;
  state.phase = "opening";
  const gift = $("#gift"), lid = $("#giftLid");
  gift.classList.add("opened");
  play($("#giftNote"), [{ opacity: 1 }, { opacity: 0 }], { duration: 300 });

  const lidDone = play(lid, [
    { transform: "none", opacity: 1 },
    { transform: "translate(30%, -95%) rotate(24deg)", opacity: 0 }
  ], { duration: reduceMotion ? 1 : 650, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" });

  await sleep(reduceMotion ? 0 : 300);
  burstSparkles();
  showDoc();
  play($("#giftWrap"), [
    { opacity: 1, transform: "translateY(-2vh)" },
    { opacity: 0, transform: "translateY(4vh) scale(0.92)" }
  ], { duration: reduceMotion ? 1 : 600, delay: reduceMotion ? 0 : 250 });
  await lidDone;
}

function burstSparkles() {
  if (reduceMotion) return;
  const r = $("#gift").getBoundingClientRect();
  const ox = r.left + r.width / 2, oy = r.top + r.height * 0.35;
  const colors = ["#f3c866", "#ffe9a8", "#f0a5cf", "#b794f4", "#ffffff"];
  const n = window.innerWidth < 600 ? 14 : 22;
  for (let i = 0; i < n; i++) {
    const el = document.createElement("span");
    el.className = "spark";
    const size = 8 + Math.random() * 10;
    el.style.width = el.style.height = size + "px";
    el.style.background = colors[(Math.random() * colors.length) | 0];
    document.body.appendChild(el);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, d = 80 + Math.random() * 170;
    const x1 = ox + Math.cos(a) * d, y1 = oy + Math.sin(a) * d;
    el.animate([
      { transform: `translate3d(${ox}px, ${oy}px, 0) scale(0.2) rotate(0deg)`, opacity: 1 },
      { transform: `translate3d(${x1}px, ${y1}px, 0) scale(1) rotate(120deg)`, opacity: 1, offset: 0.4 },
      { transform: `translate3d(${x1}px, ${y1 + 50}px, 0) scale(0) rotate(240deg)`, opacity: 0 }
    ], { duration: 900 + Math.random() * 500, easing: "ease-out", fill: "forwards" })
      .finished.then(() => el.remove()).catch(() => el.remove());
  }
}

function fileNameOf(path, fallback) {
  if (!path) return fallback;
  const last = path.split("/").pop();
  try { return decodeURIComponent(last); } catch (e) { return last; }
}
function memoriesFileName() { return fileNameOf(CONFIG.memoriesFile, "our-memories-placeholder.txt"); }
function videoFileName()    { return fileNameOf(CONFIG.videoFile, "our-video.mp4"); }

// Builds the two presents (letter + video tape) inside #doc
function buildDoc() {
  $("#doc").innerHTML = `
    <div class="presents">
      <p class="presents__text" id="docText"></p>
      <div class="presents__row">

        <div class="present">
          <button class="letter-gift" id="docBtn" type="button" aria-label="Download our memories">
            <svg class="lg__back" viewBox="0 0 200 150" aria-hidden="true">
              <path d="M0 34 L100 0 L200 34 Z" fill="#e3c99b"/>
              <rect x="0" y="30" width="200" height="120" fill="#f3e3c3"/>
            </svg>
            <span class="lg__paper" aria-hidden="true">
              <span class="lg__paperTitle" id="docTitle"></span>
              <span class="lg__paperSub" id="docPaperSub"></span>
              <span class="lg__lines"></span>
            </span>
            <svg class="lg__front" viewBox="0 0 200 150" aria-hidden="true">
              <path d="M0 30 L100 96 L0 150 Z" fill="#efdcb6" stroke="#c9ad7a" stroke-opacity=".45" stroke-width=".6"/>
              <path d="M200 30 L100 96 L200 150 Z" fill="#e9d3a8" stroke="#c9ad7a" stroke-opacity=".45" stroke-width=".6"/>
              <path d="M0 150 L100 90 L200 150 Z" fill="#f7ead0" stroke="#c9ad7a" stroke-opacity=".45" stroke-width=".6"/>
              <circle cx="100" cy="93" r="16" fill="#9e1f35"/>
              <circle cx="100" cy="93" r="16" fill="url(#seal)" />
              <circle cx="100" cy="93" r="12" fill="none" stroke="#c43a52" stroke-width="1"/>
              <path transform="translate(89.2 82.2) scale(.9)" d="M12 21s-7-4.6-9.3-9C1 8.6 3 5 6.4 5c2 0 3.6 1 5.6 3 2-2 3.6-3 5.6-3C21 5 23 8.6 21.3 12 19 16.4 12 21 12 21z" fill="#ffd9de"/>
              <defs><radialGradient id="seal" cx="35%" cy="30%"><stop offset="0" stop-color="#e0566d" stop-opacity=".9"/><stop offset="1" stop-color="#9e1f35" stop-opacity="0"/></radialGradient></defs>
            </svg>
          </button>
          <span class="present__label" id="docBtnText"></span>
          <small class="present__file" id="docName"></small>
          <span class="present__status" id="docStatus" aria-live="polite"></span>
        </div>

        <div class="present">
          <button class="vhs" id="vidBtn" type="button" aria-label="Download our video">
            <span class="vhs__label" aria-hidden="true">
              <span class="vhs__title" id="vidTitle"></span>
              <span class="vhs__sub">HOME VIDEO · 120 MIN</span>
            </span>
            <span class="vhs__window" aria-hidden="true">
              <span class="vhs__reel"></span><span class="vhs__strand"></span><span class="vhs__reel"></span>
            </span>
            <span class="vhs__foot" aria-hidden="true"></span>
          </button>
          <span class="present__label" id="vidBtnText"></span>
          <small class="present__file" id="vidName"></small>
          <span class="present__status" id="vidStatus" aria-live="polite"></span>
        </div>

      </div>
    </div>`;
}

function showDoc() {
  state.phase = "doc";
  const doc = $("#doc");
  $("#docText").textContent = CONFIG.docText;
  $("#docTitle").textContent = CONFIG.docTitle;
  $("#docPaperSub").textContent = CONFIG.memoriesLabel;
  $("#docName").textContent = memoriesFileName();
  $("#docBtnText").textContent = CONFIG.docButton;
  $("#vidTitle").textContent = CONFIG.videoTitle;
  $("#vidName").textContent = videoFileName();
  $("#vidBtnText").textContent = CONFIG.videoButton;
  doc.classList.add("show");

  const gr = $("#gift").getBoundingClientRect();
  const fromY = gr.top + gr.height * 0.4 - window.innerHeight / 2;           // starts at the mouth of the gift
  play(doc, reduceMotion ? [{ transform: "translate(-50%, -50%)", opacity: 1 }] : [
    { transform: `translate(-50%, calc(-50% + ${fromY}px)) scale(0.25) rotate(-6deg)`, opacity: 0 },
    { transform: "translate(-50%, calc(-50% - 18px)) scale(1.05) rotate(2deg)", opacity: 1, offset: 0.65 },
    { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 }
  ], { duration: reduceMotion ? 1 : 800, easing: "cubic-bezier(0.3, 0.9, 0.3, 1)" });
}

// Saves one file. Each present only ever downloads its own file.
function saveFile(href, name, blobUrl) {
  const a = document.createElement("a");
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

function downloadMemories() {
  const btn = $("#docBtn"), label = $("#docBtnText"), status = $("#docStatus");
  if (btn.disabled) return;
  btn.disabled = true;
  status.textContent = "Preparing your memories…";
  setTimeout(() => {
    if (CONFIG.memoriesFile) {
      saveFile(encodeURI(CONFIG.memoriesFile), memoriesFileName());
    } else {
      const blob = new Blob(
        ["Our memories (placeholder)\n\nThis is only a placeholder.\nSet memoriesFile in the CONFIG block of js/main.js to the real file.\n"],
        { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      saveFile(url, memoriesFileName(), url);
    }
    label.textContent = "Downloaded";
    status.textContent = CONFIG.memoriesFile ? "Saved to your device." : "Saved. This is a placeholder file for now.";
    setTimeout(() => { btn.disabled = false; label.textContent = "Download again"; }, 2200);
  }, reduceMotion ? 0 : 900);
}

function downloadVideo() {
  const btn = $("#vidBtn"), label = $("#vidBtnText"), status = $("#vidStatus");
  if (btn.disabled) return;
  if (!CONFIG.videoFile) {                       // no mp4 set yet: nothing to download, so say so
    status.textContent = "No video yet. Set videoFile in CONFIG to your .mp4.";
    return;
  }
  btn.disabled = true;
  status.textContent = "Preparing your video…";
  setTimeout(() => {
    saveFile(encodeURI(CONFIG.videoFile), videoFileName());
    label.textContent = "Downloaded";
    status.textContent = "Saved to your device.";
    setTimeout(() => { btn.disabled = false; label.textContent = "Download again"; }, 2200);
  }, reduceMotion ? 0 : 900);
}

function setupFinale() {
  const gift = $("#gift");
  gift.addEventListener("click", openGift);
  gift.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGift(); }
  });
  buildDoc();
  $("#docBtn").addEventListener("click", downloadMemories);
  $("#vidBtn").addEventListener("click", downloadVideo);
}

/* ---------- Boot ---------- */
startSky();
preloadAssets();
buildSongList();
setupMusicToggle();
setupLetter();
setupFinale();
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