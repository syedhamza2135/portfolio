"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// "The editing floor": an ambient WebGL backdrop for the hero. Mono word-fragments drift slowly
// up the page like notes on a copydesk — clichés get struck through in redline, in-voice phrases
// get underlined in ink-blue, the rest stay faint draft. The marks DRAW ON live (a strike sweeping
// across a cliché as it rises) so the field reads as revision-in-progress, not decoration. That is
// the exact craft this site sells, animated quietly behind the value prop.
//
// Details that matter:
// - Every word is sized to fit fully on screen (long phrases shrink), so nothing ever clips
//   mid-letter. Depth comes from size + opacity + speed, not z — all words sit on one plane, which
//   makes the fit math exact.
// - Fade bounds are derived from the camera's real visible extent, so words ease out before the
//   edge instead of popping off it.
// - The redline mark is a separate colored bar, not baked into the text texture: it animates by
//   scaling, and a theme toggle recolors text + marks IN PLACE (no reshuffle, no texture churn).
// - Density, sizing, opacity, speed and pixel-ratio are tuned per viewport (configFor): phones get
//   a quieter, lighter, cheaper field. Crossing a breakpoint rebuilds it.
// - Motion is delta-timed (frame-rate independent). Paused offscreen, skipped under reduced-motion
//   (the wrapper never mounts it), fully disposed on unmount.

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
  text: THREE.Sprite;
  mark: THREE.Sprite; // strike (cut) / underline (keep); hidden for plain
  kind: Kind;
  aspect: number; // text width / height of the drawn glyphs
  depth: number; // 0 = far (small/faint/slow), 1 = near
  w: number; // current world width of the text
  h: number; // current world height of the text
  baseX: number; // drift column (sway oscillates around this)
  vy: number; // upward speed, units/sec
  sway: number; // horizontal sway amplitude
  swSpeed: number;
  phase: number;
  base: number; // peak text opacity
  markBase: number; // peak mark opacity
  markYFrac: number; // mark vertical offset as a fraction of h
  markThickFrac: number; // mark thickness as a fraction of h
  markDelay: number; // seconds before the mark starts drawing
  markP: number; // mark draw-on progress 0..1
  t: number; // seconds since last recycle
};

const FOV = 50;
const CAM_Z = 10;
const MARK_DUR = 0.7; // seconds for a strike/underline to draw across

// Per-viewport tuning. Phones get a quieter, lighter, cheaper field: fewer words, capped to a
// smaller share of the (narrow) screen so they don't dominate, fainter, slower, and at a lower
// pixel-ratio cap to cut GPU fill + battery on the device that needs it most.
type Config = {
  tier: string;
  count: number;
  dprCap: number;
  opacityScale: number;
  speedScale: number;
  hBase: number; // smallest word height (far), world units
  hSpan: number; // added at the near end
  widthFrac: number; // max share of the full visible width a word may span
};
function configFor(width: number): Config {
  if (width < 600)
    return { tier: "phone", count: 11, dprCap: 1.5, opacityScale: 0.78, speedScale: 0.82, hBase: 0.4, hSpan: 0.5, widthFrac: 0.6 };
  if (width < 1024)
    return { tier: "tablet", count: 16, dprCap: 2, opacityScale: 0.9, speedScale: 0.92, hBase: 0.52, hSpan: 0.78, widthFrac: 0.78 };
  return { tier: "desktop", count: 22, dprCap: 2, opacityScale: 1, speedScale: 1, hBase: 0.62, hSpan: 1.0, widthFrac: 0.9 };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Peak opacities by depth. Marked words read a little stronger than the plain bed so the cliché is
// legible enough for the strike to read as striking *it*; the mark tracks just above its word.
// `scale` quiets the whole field on smaller screens (see configFor).
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

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      return {
        red: cs.getPropertyValue("--accent").trim() || "#b3382b",
        blue: cs.getPropertyValue("--ins").trim() || "#2b4fa0",
        muted: cs.getPropertyValue("--muted").trim() || "#585b56",
      };
    }
    let colors = readColors();
    let theme = document.documentElement.getAttribute("data-theme") || "light";

    let w = mount.clientWidth || 1;
    let h = mount.clientHeight || 1;

    let cfg = configFor(w);
    let dpr = Math.min(window.devicePixelRatio, cfg.dprCap);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.setClearAlpha(0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 0.1, 100);
    camera.position.z = CAM_Z;

    const group = new THREE.Group();
    scene.add(group);
    const words: Word[] = [];

    // Visible half-extents on the word plane (z = 0). Recomputed on resize.
    let vh = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
    let vw = vh * camera.aspect;

    const dealCut = makeDealer(CUT);
    const dealKeep = makeDealer(KEEP);

    // Draw the glyphs only (no mark) onto a tight canvas texture in the current text colour.
    function drawText(text: string, kind: Kind) {
      const fs = 64;
      const padX = 8;
      const padY = 22; // room for an underline that sits below the baseline
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = `400 ${fs}px "Courier New", monospace`;
      const tw = Math.ceil(probe.measureText(text).width);
      const cv = document.createElement("canvas");
      cv.width = (tw + padX * 2) * dpr;
      cv.height = (fs + padY * 2) * dpr;
      const c = cv.getContext("2d")!;
      c.scale(dpr, dpr);
      c.font = `400 ${fs}px "Courier New", monospace`;
      c.textBaseline = "middle";
      c.fillStyle = kind === "cut" ? colors.red : kind === "keep" ? colors.blue : colors.muted;
      c.fillText(text, padX, (fs + padY * 2) / 2);
      const tex = new THREE.CanvasTexture(cv);
      tex.colorSpace = THREE.SRGBColorSpace; // canvas is sRGB — without this three renders it washed out
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.minFilter = THREE.LinearFilter;
      return { tex, aspect: cv.width / cv.height };
    }

    // Size a word to fit fully on screen, then place its drift column and align the mark bar.
    function layout(wd: Word) {
      const maxW = vw * 2 * cfg.widthFrac;
      wd.h = Math.min(cfg.hBase + wd.depth * cfg.hSpan, maxW / wd.aspect);
      wd.w = wd.h * wd.aspect;
      wd.text.scale.set(wd.w, wd.h, 1);
      const xLimit = Math.max(0, vw - wd.w / 2 - 0.15);
      wd.baseX = Math.min(xLimit, Math.max(-xLimit, wd.baseX));
    }

    function build() {
      for (let i = 0; i < cfg.count; i++) {
        const roll = Math.random();
        const kind: Kind = roll < 0.4 ? "cut" : roll < 0.72 ? "keep" : "plain";
        const label = kind === "cut" ? dealCut() : dealKeep();
        const { tex, aspect } = drawText(label, kind);

        const textMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
        const text = new THREE.Sprite(textMat);
        text.renderOrder = 0;
        text.userData = { tex, label };

        const markMat = new THREE.SpriteMaterial({
          color: new THREE.Color(kind === "cut" ? colors.red : colors.blue),
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
        });
        const mark = new THREE.Sprite(markMat);
        mark.renderOrder = 1;
        mark.visible = kind !== "plain";

        const depth = Math.random();
        const op = opacities(kind, depth, cfg.opacityScale);
        const wd: Word = {
          text, mark, kind, aspect, depth,
          w: 1, h: 1, baseX: (Math.random() - 0.5) * vw * 1.9,
          vy: (0.13 + depth * 0.42) * cfg.speedScale,
          sway: 0.04 + Math.random() * 0.12,
          swSpeed: 0.2 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          base: op.base,
          markBase: op.markBase,
          markYFrac: kind === "keep" ? -0.32 : 0,
          markThickFrac: kind === "cut" ? 0.075 : 0.06,
          markDelay: 0.4 + Math.random() * 5,
          markP: 0,
          t: Math.random() * 6, // stagger the first wave of edits
        };
        layout(wd);
        wd.text.position.set(wd.baseX, (Math.random() - 0.5) * vh * 1.9, 0);
        words.push(wd);
        group.add(text, mark);
      }
    }
    function disposeWords() {
      for (const wd of words) {
        (wd.text.userData.tex as THREE.Texture).dispose();
        (wd.text.material as THREE.Material).dispose();
        (wd.mark.material as THREE.Material).dispose();
        group.remove(wd.text, wd.mark);
      }
      words.length = 0;
    }
    build();

    let tx = 0, ty = 0, px = 0, py = 0;
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    function recycle(wd: Word) {
      wd.t = 0;
      wd.markP = 0;
      wd.markDelay = 0.3 + Math.random() * 3;
      wd.depth = Math.random();
      wd.vy = (0.13 + wd.depth * 0.42) * cfg.speedScale;
      const op = opacities(wd.kind, wd.depth, cfg.opacityScale);
      wd.base = op.base;
      wd.markBase = op.markBase;
      wd.baseX = (Math.random() - 0.5) * vw * 1.9;
      layout(wd);
      wd.text.position.x = wd.baseX;
      wd.text.position.y = -vh - wd.h * 0.6;
    }

    // Redraw one word's text texture + reset its mark colour for the current theme.
    function recolorWord(wd: Word) {
      const label = wd.text.userData.label as string;
      const { tex } = drawText(label, wd.kind);
      const mat = wd.text.material as THREE.SpriteMaterial;
      (wd.text.userData.tex as THREE.Texture).dispose();
      mat.map = tex;
      mat.needsUpdate = true;
      wd.text.userData.tex = tex;
      if (wd.kind !== "plain") {
        (wd.mark.material as THREE.SpriteMaterial).color.set(wd.kind === "cut" ? colors.red : colors.blue);
      }
    }

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
      group.rotation.y = px * 0.18;
      group.rotation.x = -py * 0.13;

      const fadeBand = vh * 0.7;
      for (const wd of words) {
        wd.t += dt;
        wd.text.position.y += wd.vy * dt;
        if (wd.text.position.y > vh + wd.h * 0.6) recycle(wd);

        const x = wd.baseX + Math.sin(wd.t * wd.swSpeed + wd.phase) * wd.sway;
        wd.text.position.x = x;

        const y = wd.text.position.y;
        const vis = smoothstep(0, fadeBand, Math.min(vh - y, y + vh));
        (wd.text.material as THREE.SpriteMaterial).opacity = wd.base * vis * intro;

        if (wd.kind !== "plain") {
          if (wd.t > wd.markDelay) wd.markP = Math.min(1, wd.markP + dt / MARK_DUR);
          const span = wd.w * 0.96;
          const cw = span * easeOut(wd.markP);
          wd.mark.scale.set(Math.max(cw, 1e-4), wd.h * wd.markThickFrac, 1);
          wd.mark.position.set(x - span / 2 + cw / 2, y + wd.h * wd.markYFrac, 0);
          const appear = smoothstep(0, 0.12, wd.markP);
          (wd.mark.material as THREE.SpriteMaterial).opacity = wd.markBase * vis * intro * appear;
        }
      }
      renderer.render(scene, camera);
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
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      vh = Math.tan((FOV * Math.PI) / 360) * CAM_Z;
      vw = vh * camera.aspect;
      const next = configFor(w);
      if (next.tier !== cfg.tier) {
        // crossed a breakpoint (e.g. phone rotation): re-tune density/sizing/DPR from scratch.
        cfg = next;
        dpr = Math.min(window.devicePixelRatio, cfg.dprCap);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h);
        disposeWords();
        build();
      } else {
        renderer.setSize(w, h);
        for (const wd of words) layout(wd); // re-fit + re-clamp so nothing clips at the new size
      }
    });
    ro.observe(mount);

    const mo = new MutationObserver(() => {
      const nt = document.documentElement.getAttribute("data-theme") || "light";
      if (nt !== theme) {
        theme = nt;
        colors = readColors();
        for (const wd of words) recolorWord(wd);
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
      disposeWords();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
