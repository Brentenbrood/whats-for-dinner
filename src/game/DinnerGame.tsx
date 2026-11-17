import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type {
  CaughtItem,
  Category,
  GameIngredient,
  GameOutcome
} from "../types";

interface DinnerGameProps {
  ingredients: GameIngredient[];
  duration?: number;
  onFinish: (outcome: GameOutcome) => void;
}

interface FallingItem {
  id: string;
  x: number;
  y: number;
  radius: number;
  speed: number;
  swing: number;
  golden: boolean;
  emoji: string;
  label: string;
}

interface Particle {
  x: number;
  y: number;
  text: string;
  life: number;
  golden: boolean;
}

const EMOJI_FONT =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function categoryOf(
  counts: Record<string, number>,
  ingredients: GameIngredient[]
): Category | null {
  const totals = new Map<Category, number>();
  for (const [id, count] of Object.entries(counts)) {
    const category = ingredients.find((item) => item.id === id)?.category;
    if (!category) continue;
    totals.set(category, (totals.get(category) ?? 0) + count);
  }
  return (
    [...totals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  );
}

export default function DinnerGame({
  ingredients,
  duration = 30,
  onFinish
}: DinnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finishRef = useRef(onFinish);
  const ingredientsRef = useRef(ingredients);
  const countsRef = useRef<Record<string, number>>({});
  const scoreRef = useRef(0);
  const finishedRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });
  const targetXRef = useRef(0);
  const basketXRef = useRef(0);
  const keysRef = useRef({ left: false, right: false });
  const frameRef = useRef(0);
  const [phase, setPhase] = useState<"ready" | "playing">("ready");
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const golden = useMemo(
    () => ingredients[Math.floor(Math.random() * ingredients.length)],
    [ingredients]
  );

  finishRef.current = onFinish;
  ingredientsRef.current = ingredients;

  const caughtItems: CaughtItem[] = useMemo(
    () =>
      Object.entries(counts)
        .map(([id, count]) => {
          const item = ingredients.find((entry) => entry.id === id);
          return item ? { ...item, count } : null;
        })
        .filter((item): item is CaughtItem => Boolean(item))
        .sort((a, b) => b.count - a.count),
    [counts, ingredients]
  );

  function emitFinish(finalCounts: Record<string, number>, finalScore: number) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const caught = Object.entries(finalCounts)
      .map(([id, count]) => {
        const item = ingredientsRef.current.find((entry) => entry.id === id);
        return item ? { ...item, count } : null;
      })
      .filter((item): item is CaughtItem => Boolean(item))
      .sort((a, b) => b.count - a.count);
    finishRef.current({
      counts: finalCounts,
      golden: golden?.id ?? null,
      topCategory: categoryOf(finalCounts, ingredientsRef.current),
      score: finalScore,
      caught
    });
  }

  function start() {
    countsRef.current = {};
    scoreRef.current = 0;
    finishedRef.current = false;
    setCounts({});
    setScore(0);
    setSecondsLeft(duration);
    setPhase("playing");
  }

  function finishNow() {
    emitFinish(
      { ...countsRef.current },
      scoreRef.current
    );
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const context = canvas.getContext("2d");
      if (context) context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
      if (!basketXRef.current) {
        basketXRef.current = rect.width / 2;
        targetXRef.current = rect.width / 2;
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    finishedRef.current = false;
    const startedAt = performance.now();
    const items: FallingItem[] = [];
    const particles: Particle[] = [];
    const keys = keysRef.current;
    let lastFrame = startedAt;
    let lastSpawn = startedAt;
    let spawnIndex = 0;
    let lastUi = startedAt;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = true;
        event.preventDefault();
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = true;
        event.preventDefault();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        keys.left = false;
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        keys.right = false;
      }
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);

    const spawn = (now: number) => {
      const pool = ingredientsRef.current;
      if (!pool.length) return;
      const forceGolden = spawnIndex % 7 === 3;
      const options = forceGolden
        ? pool.filter((item) => item.id === golden?.id)
        : pool.filter((item) => item.id !== golden?.id);
      const choice =
        options[Math.floor(Math.random() * options.length)] ??
        pool[Math.floor(Math.random() * pool.length)];
      if (!choice) return;
      const { width } = sizeRef.current;
      const margin = 34;
      items.push({
        id: choice.id,
        x: margin + Math.random() * Math.max(40, width - margin * 2),
        y: -36,
        radius: 25,
        speed: 82 + Math.random() * 45 + ((now - startedAt) / 1000) * 2.1,
        swing: Math.random() * Math.PI * 2,
        golden: forceGolden,
        emoji: choice.emoji,
        label: choice.label
      });
      spawnIndex += 1;
    };

    const drawBackground = (width: number, height: number) => {
      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#123c2d");
      gradient.addColorStop(0.65, "#1b5341");
      gradient.addColorStop(1, "#22634c");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255,255,255,0.045)";
      for (let x = 18; x < width; x += 42) {
        for (let y = 18; y < height; y += 42) {
          context.beginPath();
          context.arc(x, y, 1.6, 0, Math.PI * 2);
          context.fill();
        }
      }

      const glow = context.createRadialGradient(
        width / 2,
        height + 40,
        20,
        width / 2,
        height + 40,
        Math.max(width, height) * 0.8
      );
      glow.addColorStop(0, "rgba(216,239,155,0.18)");
      glow.addColorStop(1, "rgba(216,239,155,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    };

    const drawBasket = (width: number, height: number) => {
      const basketWidth = Math.min(156, Math.max(104, width * 0.2));
      const basketHeight = 48;
      const x = basketXRef.current;
      const y = height - 66;

      context.save();
      context.fillStyle = "rgba(0,0,0,0.22)";
      context.beginPath();
      context.ellipse(x, y + basketHeight + 14, basketWidth * 0.52, 9, 0, 0, Math.PI * 2);
      context.fill();

      const body = context.createLinearGradient(0, y, 0, y + basketHeight);
      body.addColorStop(0, "#f0b74f");
      body.addColorStop(1, "#c98727");
      context.fillStyle = body;
      context.beginPath();
      context.moveTo(x - basketWidth / 2, y);
      context.lineTo(x + basketWidth / 2, y);
      context.lineTo(x + basketWidth / 2 - 16, y + basketHeight);
      context.lineTo(x - basketWidth / 2 + 16, y + basketHeight);
      context.closePath();
      context.fill();

      context.strokeStyle = "rgba(90,55,9,0.35)";
      context.lineWidth = 2;
      for (let offset = -2; offset <= 2; offset += 1) {
        context.beginPath();
        context.moveTo(x + offset * (basketWidth / 5.4), y + 4);
        context.lineTo(
          x + offset * (basketWidth / 6.6),
          y + basketHeight - 4
        );
        context.stroke();
      }
      context.beginPath();
      context.moveTo(x - basketWidth / 2 + 4, y + basketHeight / 2);
      context.lineTo(x + basketWidth / 2 - 4, y + basketHeight / 2);
      context.stroke();

      const rim = context.createLinearGradient(0, y - 10, 0, y + 4);
      rim.addColorStop(0, "#ffd985");
      rim.addColorStop(1, "#e2a437");
      context.fillStyle = rim;
      roundRect(context, x - basketWidth / 2 - 5, y - 10, basketWidth + 10, 15, 7);
      context.fill();

      context.strokeStyle = "#e2a437";
      context.lineWidth = 7;
      context.beginPath();
      context.arc(x, y - 8, basketWidth * 0.34, Math.PI * 1.05, Math.PI * 1.95);
      context.stroke();
      context.restore();
    };

    const drawItem = (item: FallingItem) => {
      context.save();
      if (item.golden) {
        const halo = context.createRadialGradient(
          item.x,
          item.y,
          4,
          item.x,
          item.y,
          item.radius * 2.1
        );
        halo.addColorStop(0, "rgba(255,214,102,0.65)");
        halo.addColorStop(1, "rgba(255,214,102,0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(item.x, item.y, item.radius * 2.1, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowColor = "rgba(0,0,0,0.25)";
      context.shadowBlur = 12;
      context.shadowOffsetY = 5;
      context.fillStyle = item.golden ? "#fff4cf" : "#fffdf6";
      context.beginPath();
      context.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = "transparent";

      if (item.golden) {
        context.strokeStyle = "#f5b52c";
        context.lineWidth = 3;
        context.beginPath();
        context.arc(item.x, item.y, item.radius - 1.5, 0, Math.PI * 2);
        context.stroke();
      }

      context.font = `26px ${EMOJI_FONT}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(item.emoji, item.x, item.y + 1);
      context.restore();
    };

    const frame = (now: number) => {
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const { width, height } = sizeRef.current;
      const elapsed = now - startedAt;

      if (now - lastSpawn > 610) {
        spawn(now);
        lastSpawn = now;
      }

      const basketWidth = Math.min(156, Math.max(104, width * 0.2));
      const keyboardSpeed = 430;
      if (keys.left) targetXRef.current -= keyboardSpeed * delta;
      if (keys.right) targetXRef.current += keyboardSpeed * delta;
      targetXRef.current = Math.max(
        basketWidth / 2 + 6,
        Math.min(width - basketWidth / 2 - 6, targetXRef.current)
      );
      basketXRef.current +=
        (targetXRef.current - basketXRef.current) * Math.min(1, delta * 14);

      const basketTop = height - 62;
      for (let index = items.length - 1; index >= 0; index -= 1) {
        const item = items[index];
        item.y += item.speed * delta;
        item.x += Math.sin(now / 850 + item.swing) * 10 * delta;

        const withinX =
          Math.abs(item.x - basketXRef.current) <
          basketWidth / 2 + item.radius * 0.55;
        const caught =
          withinX && item.y + item.radius * 0.5 >= basketTop && item.y < height;

        if (caught) {
          const amount = item.golden ? 3 : 1;
          const current = countsRef.current[item.id] ?? 0;
          countsRef.current[item.id] = Math.min(9, current + amount);
          scoreRef.current += item.golden ? 30 : 10;
          particles.push({
            x: item.x,
            y: item.y,
            text: item.golden ? "+3" : "+1",
            life: 1,
            golden: item.golden
          });
          items.splice(index, 1);
          continue;
        }

        if (item.y - item.radius > height + 20) items.splice(index, 1);
      }

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.life -= delta * 1.4;
        particle.y -= 34 * delta;
        if (particle.life <= 0) particles.splice(index, 1);
      }

      if (now - lastUi > 140) {
        lastUi = now;
        setSecondsLeft(Math.max(0, Math.ceil((duration * 1000 - elapsed) / 1000)));
        setScore(scoreRef.current);
        setCounts({ ...countsRef.current });
      }

      drawBackground(width, height);
      for (const item of items) drawItem(item);
      drawBasket(width, height);

      for (const particle of particles) {
        context.save();
        context.globalAlpha = Math.max(0, particle.life);
        context.font = `700 18px Inter, sans-serif`;
        context.textAlign = "center";
        context.fillStyle = particle.golden ? "#ffe28a" : "#d8ef9b";
        context.fillText(particle.text, particle.x, particle.y);
        context.restore();
      }

      if (elapsed >= duration * 1000) {
        emitFinish({ ...countsRef.current }, scoreRef.current);
        return;
      }

      frameRef.current = requestAnimationFrame(frame);
    };

    frameRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.left = false;
      keys.right = false;
    };
  }, [phase, duration, golden]);

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (phase !== "playing") return;
    const rect = event.currentTarget.getBoundingClientRect();
    targetXRef.current = Math.max(
      6,
      Math.min(rect.width - 6, event.clientX - rect.left)
    );
  };

  const caughtPreview = caughtItems.slice(0, 6);

  return (
    <div className="game-shell">
      <div className="game-hud">
        <div className="hud-block">
          <span className="hud-label">Time</span>
          <strong>{secondsLeft}s</strong>
        </div>
        <div className="hud-progress" aria-hidden="true">
          <span
            style={{
              width: `${Math.max(0, (secondsLeft / duration) * 100)}%`
            }}
          />
        </div>
        <div className="hud-block">
          <span className="hud-label">Score</span>
          <strong>{score}</strong>
        </div>
        <div className="hud-golden">
          <span>Golden</span>
          <strong>
            {golden?.emoji} {golden?.label}
          </strong>
        </div>
      </div>

      <div className="game-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          role="application"
          tabIndex={0}
          aria-label="Dinner dash. Move the basket with the left and right arrow keys, or drag on the canvas, to catch falling ingredients."
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
        />

        {phase === "ready" && (
          <div className="game-overlay">
            <span className="eyebrow">Dinner dash</span>
            <h2>Catch your dinner.</h2>
            <p>
              Catch falling ingredients for {duration} seconds. The golden
              ingredient is worth triple. Whatever lands in your basket shapes
              the recipe.
            </p>
            <div className="game-howto">
              <span>Drag to move</span>
              <span>⭐ Golden = +3</span>
            </div>
            <button className="btn btn-primary btn-large" type="button" onClick={start}>
              Start catching
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() =>
                emitFinish(
                  {},
                  0
                )
              }
            >
              Skip the game and use the deals
            </button>
          </div>
        )}
      </div>

      <div className="game-caught" aria-live="polite">
        {caughtPreview.length === 0 ? (
          <span className="caught-empty">
            {phase === "playing"
              ? "Your basket is empty — start scooping!"
              : "Your basket will appear here."}
          </span>
        ) : (
          caughtPreview.map((item) => (
            <span className="caught-chip" key={item.id}>
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
              <strong>×{item.count}</strong>
            </span>
          ))
        )}
      </div>

      {phase === "playing" && (
        <div className="game-footer">
          <span>Drag, tap or use the arrow keys.</span>
          <button className="text-button" type="button" onClick={finishNow}>
            Finish early
          </button>
        </div>
      )}
    </div>
  );
}
