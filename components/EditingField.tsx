"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// "The editing floor": an ambient WebGL backdrop for the hero — a slow drift of word-fragments,
// clichés struck out in redline, in-voice words underlined in ink-blue, the rest faint. Reinforces
// the revision signature without competing (low opacity, behind the content). Motion is
// delta-timed (frame-rate independent), words fade in/out at the recycle bounds instead of
// popping, and a theme toggle recolors the textures IN PLACE (positions and motion preserved, no
// reshuffle). Paused offscreen, skipped under reduced-motion (the wrapper doesn't mount it),
// fully disposed on unmount.
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
type Word = { sprite: THREE.Sprite; text: string; kind: Kind; base: number; vy: number };

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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    const DPR = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(w, h);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.z = 10;

    const group = new THREE.Group();
    scene.add(group);
    const words: Word[] = [];

    // Draw one word to a canvas texture, in the current theme colors.
    function drawWord(text: string, kind: Kind) {
      const fs = 60;
      const pad = 18;
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = `400 ${fs}px "Courier New", monospace`;
      const tw = Math.ceil(probe.measureText(text).width);
      const cv = document.createElement("canvas");
      cv.width = (tw + pad * 2) * DPR;
      cv.height = (fs + pad * 2) * DPR;
      const c = cv.getContext("2d")!;
      c.scale(DPR, DPR);
      c.font = `400 ${fs}px "Courier New", monospace`;
      c.textBaseline = "middle";
      const mid = (fs + pad * 2) / 2;
      c.fillStyle = kind === "cut" ? colors.red : kind === "keep" ? colors.blue : colors.muted;
      c.fillText(text, pad, mid);
      if (kind === "cut") {
        c.strokeStyle = colors.red;
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(pad, mid);
        c.lineTo(pad + tw, mid);
        c.stroke();
      } else if (kind === "keep") {
        c.strokeStyle = colors.blue;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(pad, mid + fs * 0.4);
        c.lineTo(pad + tw, mid + fs * 0.4);
        c.stroke();
      }
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.minFilter = THREE.LinearFilter;
      return { tex, aspect: cv.width / cv.height };
    }

    function build() {
      for (let i = 0; i < 24; i++) {
        const roll = Math.random();
        const kind: Kind = roll < 0.42 ? "cut" : roll < 0.72 ? "keep" : "plain";
        const list = kind === "cut" ? CUT : KEEP;
        const text = list[(Math.random() * list.length) | 0];
        const { tex, aspect } = drawWord(text, kind);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
        const sp = new THREE.Sprite(mat);
        const s = 0.55 + Math.random() * 0.85;
        sp.scale.set(s * aspect, s, 1);
        sp.position.set((Math.random() - 0.5) * 19, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 9);
        const depth = (sp.position.z + 4.5) / 9;
        sp.userData = { tex };
        // vy in units per SECOND (delta-timed) — matches the old per-frame drift at 60fps.
        words.push({ sprite: sp, text, kind, base: 0.08 + depth * 0.2, vy: 0.18 + Math.random() * 0.55 });
        group.add(sp);
      }
    }
    build();

    // Theme change: redraw each texture in the new colors, keep position/opacity/motion intact.
    function recolor() {
      for (const wd of words) {
        const { tex } = drawWord(wd.text, wd.kind);
        const mat = wd.sprite.material as THREE.SpriteMaterial;
        (wd.sprite.userData.tex as THREE.Texture).dispose();
        mat.map = tex;
        mat.needsUpdate = true;
        wd.sprite.userData.tex = tex;
      }
    }

    let tx = 0, ty = 0, px = 0, py = 0;
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    window.addEventListener("pointermove", onMove);

    // Smooth fade near the top/bottom edges so words ease in and out instead of popping.
    const Y = 6.8;
    const FADE = 1.7;
    function edge(y: number) {
      const d = Math.max(0, Math.min(Y - y, y + Y));
      const t = Math.min(1, d / FADE);
      return t * t * (3 - 2 * t);
    }

    let raf = 0;
    let visible = true;
    let intro = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp so a resume after pause doesn't jump
      last = now;
      intro = Math.min(1, intro + dt / 1.2); // ~1.2s global fade-in on load

      const k = 1 - Math.exp(-2.5 * dt); // frame-rate-independent parallax easing
      px += (tx - px) * k;
      py += (ty - py) * k;
      group.rotation.y = px * 0.22;
      group.rotation.x = -py * 0.16;

      for (const wd of words) {
        const sp = wd.sprite;
        sp.position.y += wd.vy * dt;
        if (sp.position.y > Y) {
          sp.position.y = -Y;
          sp.position.x = (Math.random() - 0.5) * 19;
        }
        (sp.material as THREE.SpriteMaterial).opacity = wd.base * edge(sp.position.y) * intro;
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
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    function disposeSprites() {
      for (const wd of words) {
        (wd.sprite.userData.tex as THREE.Texture).dispose();
        (wd.sprite.material as THREE.Material).dispose();
      }
      group.clear();
      words.length = 0;
    }
    const mo = new MutationObserver(() => {
      const nt = document.documentElement.getAttribute("data-theme") || "light";
      if (nt !== theme) {
        theme = nt;
        colors = readColors();
        recolor();
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
      disposeSprites();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}
