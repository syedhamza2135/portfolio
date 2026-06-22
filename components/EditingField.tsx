"use client";

import { useEffect, useRef } from "react";

// "The editing floor": an ambient backdrop for the hero. Mono word-fragments drift slowly up the
// page like notes on a copydesk — clichés get struck through in redline, in-voice phrases get
// underlined in ink-blue, the rest stay faint draft. The marks DRAW ON live (a strike sweeping
// across a cliché as it rises) so the field reads as revision-in-progress, not decoration. That is
// the exact craft this site sells, animated quietly behind the value prop.
//
// Hand-built on the 2D canvas — no WebGL, no 3D engine, ~3KB. The effect was always 2D (one plane
// of drifting text), so three.js bought nothing but ~130KB gz; dropping it keeps the lean-JS value
// prop the rest of the site argues for. Text is drawn directly with fillText (crisp at any DPR, no
// texture churn), so a theme swap recolours the whole field in place on the next frame.
//
// Details that matter:
// - Every word is sized to fit fully on screen (long phrases shrink), so nothing ever clips
//   mid-letter. Depth comes from size + opacity + speed.
// - Words ease out before the top/bottom edge instead of popping off it.
// - A theme-aware dim + a radial mask keep the field clear of the headline: in the central reading
//   column it drops to a faint paper texture, so a stray strike never looks like it's striking the
//   real copy. It stays livelier toward the margins.
// - Density, sizing, opacity, speed and pixel-ratio are tuned per viewport (configFor): phones get
//   a quieter, lighter, cheaper field. Crossing a breakpoint rebuilds it.
// - Motion is delta-timed (frame-rate independent). Paused offscreen, skipped under reduced-motion
//   (the wrapper never mounts it), fully torn down on unmount.

const CUT = [
  "in today's landscape", "synergy", "leverage", "best-in-class", "circle back",
  "moving forward", "low-hanging fruit", "at scale", "thought leadership", "robust",
  "seamless", "game-changing", "unpack", "deep dive",
];
const KEEP = [
  "cadence", "your voice", "say it plainly", "specific", "the reader",
  "ship it", "in one pass", "sounds like you", "cut the filler", "plain verbs",
];

type Kind = "cut" | "keep" | "plain";
type Word = {
  text: string;
  kind: Kind;
  fontSize: number; // px
  width: number; // measured text width at fontSize, px
  depth: number; // 0 = far (small/faint/slow), 1 = near
  baseX: number; // drift column centre, px (sway oscillates around this)
  y: number; // vertical centre, px (drifts upward → decreasing)
  vy: number; // upward speed, px/sec
  sway: number; // horizontal sway amplitude, px
  swSpeed: number;
  phase: number;
  base: number; // peak text opacity
  markBase: number; // peak mark opacity
  markDelay: number; // seconds before the mark starts drawing
  markP: number; // mark draw-on progress 0..1
  t: number; // seconds since last recycle
};

const MARK_DUR = 0.7; // seconds for a strike/underline to draw across
const PARALLAX = 16; // px of pointer parallax at the field edges

// Per-viewport tuning. Phones get a quieter, lighter, cheaper field: fewer words, fainter, slower,
// capped to a smaller share of the (narrow) screen, and a lower pixel-ratio cap to cut fill cost.
type Config = {
  tier: string;
  count: number;
  dprCap: number;
  opacityScale: number;
  speedScale: number;
  fontMin: number; // smallest word size (far), px
  fontSpan: number; // added at the near end, px
  widthFrac: number; // max share of the full width a word may span
};
function configFor(width: number): Config {
  if (width < 600)
    return { tier: "phone", count: 10, dprCap: 1.5, opacityScale: 0.78, speedScale: 0.82, fontMin: 20, fontSpan: 26, widthFrac: 0.66 };
  if (width < 1024)
    return { tier: "tablet", count: 15, dprCap: 2, opacityScale: 0.9, speedScale: 0.92, fontMin: 26, fontSpan: 44, widthFrac: 0.8 };
  return { tier: "desktop", count: 20, dprCap: 2, opacityScale: 1, speedScale: 1, fontMin: 30, fontSpan: 58, widthFrac: 0.92 };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Peak opacities by depth. Marked words read a little stronger than the plain bed so the cliché is
// legible enough for the strike to read as striking *it*. `scale` quiets the whole field on small
// screens (see configFor).
function opacities(kind: Kind, depth: number, scale: number) {
  const base = ((kind === "plain" ? 0.13 : 0.18) + depth * 0.2) * scale;
  return { base, markBase: base * 1.25 };
}

// Shuffled, non-repeating draw from a list so the same phrase doesn't appear twice at once.
function makeDealer(list: string[]) {
  let bag: number[] = [];
  return () => {
    if (bag.length === 0) {
      bag = list.map((_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return list[bag.pop()!];
  };
}

export default function EditingField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    // Radial mask: keep the central reading column (where the headline sits) a faint texture, and
    // let the field breathe toward the margins. Pure CSS, GPU-cheap, layout-independent.
    const maskImage =
      "radial-gradient(125% 85% at 50% 42%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.55) 45%, #000 82%)";
    canvas.style.maskImage = maskImage;
    canvas.style.webkitMaskImage = maskImage;
    mount.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      return {
        cut: cs.getPropertyValue("--accent").trim() || "#b3382b",
        keep: cs.getPropertyValue("--ins").trim() || "#2b4fa0",
        plain: cs.getPropertyValue("--muted").trim() || "#585b56",
      };
    }
    function dimFor(t: string) {
      // Light/bond shows red+blue marks at higher contrast, so dim the field more there; the dark
      // carbon shell can carry it closer to full strength.
      return t === "dark" ? 1 : 0.6;
    }
    let colors = readColors();
    let theme = document.documentElement.getAttribute("data-theme") || "light";
    let dim = dimFor(theme);

    let w = mount.clientWidth || 1;
    let h = mount.clientHeight || 1;
    let cfg = configFor(w);
    let dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);

    function setSize() {
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS px regardless of DPR
    }
    setSize();

    const colorOf = (k: Kind) => (k === "cut" ? colors.cut : k === "keep" ? colors.keep : colors.plain);
    const dealCut = makeDealer(CUT);
    const dealKeep = makeDealer(KEEP);
    const words: Word[] = [];

    // Size a word from its depth, shrink it to fit the width budget, then clamp its drift column so
    // it never clips at the edges.
    function layout(wd: Word) {
      let fs = cfg.fontMin + wd.depth * cfg.fontSpan;
      ctx.font = `${fs}px "Courier New", ui-monospace, monospace`;
      let width = ctx.measureText(wd.text).width;
      const maxW = w * cfg.widthFrac;
      if (width > maxW) {
        fs *= maxW / width;
        ctx.font = `${fs}px "Courier New", ui-monospace, monospace`;
        width = ctx.measureText(wd.text).width;
      }
      wd.fontSize = fs;
      wd.width = width;
      const xLimit = Math.max(0, w / 2 - width / 2 - 8);
      wd.baseX = Math.min(w / 2 + xLimit, Math.max(w / 2 - xLimit, wd.baseX));
    }

    function spawn(initial: boolean): Word {
      const roll = Math.random();
      const kind: Kind = roll < 0.4 ? "cut" : roll < 0.72 ? "keep" : "plain";
      const text = kind === "cut" ? dealCut() : dealKeep();
      const depth = Math.random();
      const op = opacities(kind, depth, cfg.opacityScale);
      const wd: Word = {
        text, kind, depth,
        fontSize: cfg.fontMin, width: 1,
        baseX: w / 2 + (Math.random() - 0.5) * w * 0.92,
        y: initial ? Math.random() * h : h + cfg.fontMin,
        vy: (10 + depth * 30) * cfg.speedScale,
        sway: 6 + Math.random() * 16,
        swSpeed: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        base: op.base,
        markBase: op.markBase,
        markDelay: 0.4 + Math.random() * 5,
        markP: 0,
        t: Math.random() * 6, // stagger the first wave of edits
      };
      layout(wd);
      return wd;
    }
    function build() {
      for (let i = 0; i < cfg.count; i++) words.push(spawn(true));
    }
    function recycle(wd: Word) {
      wd.t = 0;
      wd.markP = 0;
      wd.markDelay = 0.3 + Math.random() * 3;
      wd.depth = Math.random();
      wd.vy = (10 + wd.depth * 30) * cfg.speedScale;
      const op = opacities(wd.kind, wd.depth, cfg.opacityScale);
      wd.base = op.base;
      wd.markBase = op.markBase;
      wd.baseX = w / 2 + (Math.random() - 0.5) * w * 0.92;
      layout(wd);
      wd.y = h + wd.fontSize;
    }
    build();

    // Pointer parallax. The wrapper is pointer-events-none, so listen on the window.
    let tx = 0, ty = 0, px = 0, py = 0;
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    let raf = 0;
    let visible = true;
    let intro = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp so a resume after pause doesn't jump
      last = now;
      intro = Math.min(1, intro + dt / 1.1);

      const k = 1 - Math.exp(-2.5 * dt); // frame-rate-independent parallax easing
      px += (tx - px) * k;
      py += (ty - py) * k;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(px * PARALLAX, py * PARALLAX);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fadeBand = h * 0.16;
      for (const wd of words) {
        wd.t += dt;
        wd.y -= wd.vy * dt;
        if (wd.y < -wd.fontSize) recycle(wd);

        const x = wd.baseX + Math.sin(wd.t * wd.swSpeed + wd.phase) * wd.sway;
        const vis = smoothstep(0, fadeBand, Math.min(wd.y, h - wd.y));
        const a = wd.base * vis * intro * dim;

        ctx.font = `${wd.fontSize}px "Courier New", ui-monospace, monospace`;
        ctx.fillStyle = colorOf(wd.kind);
        ctx.globalAlpha = a;
        ctx.fillText(wd.text, x, wd.y);

        if (wd.kind !== "plain") {
          if (wd.t > wd.markDelay) wd.markP = Math.min(1, wd.markP + dt / MARK_DUR);
          if (wd.markP > 0) {
            const span = wd.width * 0.96;
            const drawn = span * easeOut(wd.markP);
            const thick = Math.max(1.5, wd.fontSize * (wd.kind === "cut" ? 0.075 : 0.06));
            const my = wd.kind === "cut" ? wd.y : wd.y + wd.fontSize * 0.34; // strike vs underline
            ctx.fillStyle = wd.kind === "cut" ? colors.cut : colors.keep;
            ctx.globalAlpha = wd.markBase * vis * intro * dim * smoothstep(0, 0.12, wd.markP);
            ctx.fillRect(x - span / 2, my - thick / 2, drawn, thick);
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      raf = visible ? requestAnimationFrame(frame) : 0;
    }

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      }),
      { threshold: 0 }
    );
    io.observe(mount);

    const ro = new ResizeObserver(() => {
      w = mount.clientWidth || 1;
      h = mount.clientHeight || 1;
      const next = configFor(w);
      if (next.tier !== cfg.tier) {
        // crossed a breakpoint (e.g. phone rotation): re-tune density/sizing/DPR from scratch.
        cfg = next;
        dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
        setSize();
        words.length = 0;
        build();
      } else {
        setSize();
        for (const wd of words) {
          layout(wd); // re-fit + re-clamp so nothing clips at the new size
          wd.y = Math.min(h + wd.fontSize, Math.max(-wd.fontSize, wd.y));
        }
      }
    });
    ro.observe(mount);

    const mo = new MutationObserver(() => {
      const nt = document.documentElement.getAttribute("data-theme") || "light";
      if (nt !== theme) {
        theme = nt;
        colors = readColors(); // recoloured in place on the next frame, no rebuild
        dim = dimFor(theme);
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      words.length = 0;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
