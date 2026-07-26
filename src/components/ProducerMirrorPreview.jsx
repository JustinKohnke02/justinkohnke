import { useState, useEffect, useMemo } from "react";

// ---- Demo data generation (simulates what real Live API + audio analysis would feed in) ----

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function useSimClock() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => v + 1), 90);
    return () => clearInterval(id);
  }, []);
  return t;
}

// Pitch usage: weighted toward a "root-heavy" tech house pattern, slowly accumulating
function usePitchUsage(t) {
  return useMemo(() => {
    const base = [14, 1, 3, 0, 6, 2, 0, 9, 0, 4, 0, 1]; // C minor-ish, root/5th heavy
    const wobble = Math.sin(t / 14) * 1.5;
    return base.map((v, i) => Math.max(0, v + (i === 0 ? wobble : Math.sin(t / 20 + i) * 0.6)));
  }, [t]);
}

// 16-bar similarity grid: bars 0-7 are a tight loop (near-identical), 8-15 slowly diverge
function useBarVariation(t) {
  return useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const drift = i < 8 ? 0.08 + (i % 4 === 0 ? 0.04 : 0) : 0.15 + (i - 8) * 0.07;
      const pulse = Math.sin(t / 10 + i * 0.7) * 0.05;
      return Math.min(1, Math.max(0, drift + pulse));
    });
  }, [t]);
}

// Frequency band occupancy: low end packed, low-mid building, highs sparse
function useSpaceBands(t) {
  const bands = ["Sub", "Low", "Lo-Mid", "Mid", "Hi-Mid", "High", "Air"];
  return useMemo(() => {
    const targets = [0.85, 0.78, 0.42, 0.55, 0.2, 0.12, 0.05];
    return bands.map((name, i) => ({
      name,
      level: Math.max(0, Math.min(1, targets[i] + Math.sin(t / (8 + i) + i) * 0.08)),
    }));
  }, [t]);
}

// Spectrum bars with a trailing "ghost" of ~2.5s ago
function useSpectrum(t) {
  const N = 28;
  return useMemo(() => {
    const now = Array.from({ length: N }, (_, i) => {
      const curve = Math.exp(-i / 9) * 0.9 + Math.exp(-Math.pow(i - 18, 2) / 40) * 0.35;
      const noise = Math.abs(Math.sin(t / 3 + i * 1.3)) * 0.15;
      return Math.min(1, curve + noise);
    });
    const ghost = Array.from({ length: N }, (_, i) => {
      const tg = t - 18;
      const curve = Math.exp(-i / 9) * 0.75 + Math.exp(-Math.pow(i - 18, 2) / 40) * 0.25;
      const noise = Math.abs(Math.sin(tg / 3 + i * 1.3)) * 0.12;
      return Math.min(1, curve + noise);
    });
    return { now, ghost };
  }, [t]);
}

// ---- Module: Key ----

function KeyModule({ t, compact }) {
  const usage = usePitchUsage(t);
  const max = Math.max(...usage, 1);
  const detectedKey = "C minor";
  const cx = 100, cy = 100, r = 72;

  return (
    <Panel title="KEY" sub={detectedKey} compact={compact}>
      <div
        className={compact ? "w-full h-full" : ""}
        style={compact ? undefined : { width: 110, height: 110, flexShrink: 0 }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dde2e0" strokeWidth="1" />
          {NOTE_NAMES.map((name, i) => {
            const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const intensity = usage[i] / max;
            const barLen = 14 + intensity * 30;
            const x1 = cx + Math.cos(angle) * r;
            const y1 = cy + Math.sin(angle) * r;
            const x2 = cx + Math.cos(angle) * (r + barLen);
            const y2 = cy + Math.sin(angle) * (r + barLen);
            const lx = cx + Math.cos(angle) * (r + 44);
            const ly = cy + Math.sin(angle) * (r + 44);
            const isRoot = i === 0;
            return (
              <g key={name}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isRoot ? "var(--accent)" : intensity > 0.4 ? "#8fb8ae" : "#c7cdcb"}
                  strokeWidth={isRoot ? 4 : 3}
                  strokeLinecap="round"
                  opacity={intensity > 0.02 ? 1 : 0.35}
                />
                {!compact && (
                  <text
                    x={lx} y={ly}
                    fill={isRoot ? "var(--accent)" : "#8a9490"}
                    fontSize="9"
                    fontFamily="ui-monospace, monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {name}
                  </text>
                )}
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r="3" fill="var(--accent)" />
        </svg>
      </div>
      {!compact && <ObsLine>root-heavy · no modulation in last 20 bars</ObsLine>}
    </Panel>
  );
}

// ---- Module: Variation (16-bar grid) ----

function VariationModule({ t, compact }) {
  const vals = useBarVariation(t);
  // Compact tiles are only ~20px wide — 8 columns would collapse to sub-pixel
  // cells, so show 4 grouped/averaged bars instead of the full 16-cell grid.
  const displayVals = compact
    ? Array.from({ length: 4 }, (_, g) => {
        const group = vals.slice(g * 4, g * 4 + 4);
        return group.reduce((a, b) => a + b, 0) / group.length;
      })
    : vals;
  return (
    <Panel title="VARIATION" sub="16-bar loop" compact={compact}>
      <div
        className={compact ? "grid grid-cols-4 gap-1 w-full h-full" : "grid grid-cols-8 gap-[3px]"}
        style={compact ? undefined : { width: 145, flexShrink: 0 }}
      >
        {displayVals.map((v, i) => {
          const isRepeat = v < 0.12;
          const lightness = 88 - v * 38;
          return (
            <div
              key={i}
              className={`relative rounded-[2px] flex items-end justify-start p-1 ${compact ? "" : "aspect-square"}`}
              style={{
                background: isRepeat ? "#eef1f0" : `hsl(174, ${35 + v * 35}%, ${lightness}%)`,
                outline: isRepeat ? "1px solid #dde2e0" : "none",
              }}
            >
              {!compact && (
                <span
                  className="text-[9px] font-mono leading-none"
                  style={{ color: isRepeat ? "#9aa5a1" : v > 0.5 ? "#0e2f2a" : "#3d5a54" }}
                >
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {!compact && <ObsLine>bars 1–7 nearly identical · drift begins bar 9</ObsLine>}
    </Panel>
  );
}

// ---- Module: Space (frequency band occupancy) ----

function SpaceModule({ t, compact }) {
  const bands = useSpaceBands(t);
  // Compact tiles are only ~20px wide — 7 bars + gaps would round to 0px each,
  // so show 3 representative bands with minimal gap instead.
  const displayBands = compact ? bands.filter((_, i) => i % 3 === 0) : bands;
  return (
    <Panel title="SPACE" sub="band occupancy" compact={compact}>
      <div
        className={compact ? "flex items-end gap-0.5 w-full h-full justify-between" : "flex items-end gap-2 px-1 pb-1 h-full"}
        style={compact ? undefined : { width: 135, flexShrink: 0 }}
      >
        {displayBands.map((b) => (
          <div key={b.name} className={compact ? "flex flex-col items-center flex-1 h-full justify-end" : "flex flex-col items-center gap-1.5 flex-1 h-full justify-end"}>
            <div className="relative w-full flex-1 flex items-end" style={compact ? undefined : { maxWidth: 22 }}>
              <div
                className="w-full rounded-sm transition-all duration-150"
                style={{
                  height: `${b.level * 100}%`,
                  background:
                    b.level > 0.7
                      ? "linear-gradient(180deg, #ff9a6a, var(--accent))"
                      : "linear-gradient(180deg, #8fb8ae, #c7cdcb)",
                  opacity: 0.55 + b.level * 0.45,
                }}
              />
            </div>
            {!compact && (
              <span className="text-[8px] font-mono text-[#8a9490] tracking-tight">{b.name}</span>
            )}
          </div>
        ))}
      </div>
      {!compact && <ObsLine>sub + low at capacity · headroom above 2kHz</ObsLine>}
    </Panel>
  );
}

// ---- Module: Frequency Spectrum ----

function SpectrumModule({ t, compact }) {
  const { now, ghost } = useSpectrum(t);
  const N = now.length;
  return (
    <Panel title="FREQUENCY" sub="master · 2.5s trail" compact={compact}>
      <div
        className={compact ? "w-full h-full" : "h-full"}
        style={compact ? undefined : { width: 135, flexShrink: 0 }}
      >
        <svg viewBox="0 0 280 110" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={ghost.map((v, i) => `${(i / (N - 1)) * 280},${108 - v * 100}`).join(" ")}
            fill="none"
            stroke="#c7cdcb"
            strokeWidth="1.5"
            opacity="0.8"
          />
          <polyline
            points={`0,108 ${now.map((v, i) => `${(i / (N - 1)) * 280},${108 - v * 100}`).join(" ")} 280,108`}
            fill="url(#specFill)"
            stroke="var(--accent)"
            strokeWidth="1.5"
            opacity="0.95"
          />
          <defs>
            <linearGradient id="specFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {!compact && <ObsLine>shape unchanged since last snapshot</ObsLine>}
    </Panel>
  );
}

// ---- Shared chrome ----

function Panel({ title, sub, children, compact }) {
  return (
    <div
      className="bg-white border rounded-md flex flex-col h-full"
      style={{ borderColor: "var(--line)", padding: compact ? 8 : 16 }}
    >
      {!compact && (
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[11px] font-mono tracking-[0.18em]" style={{ color: "var(--accent)" }}>
            {title}
          </h3>
          <span className="text-[9px] font-mono text-[#8a9490]">{sub}</span>
        </div>
      )}
      <div className={compact ? "flex-1 flex items-center justify-center min-h-0" : "flex-1 flex items-center gap-4 min-h-0"}>
        {children}
      </div>
    </div>
  );
}

function ObsLine({ children }) {
  return (
    <div className="flex-1 min-w-0 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
      <p className="text-[10px] font-mono text-[#6b7570] leading-snug">{children}</p>
    </div>
  );
}

export default function ProducerMirrorPreview({ compact = false }) {
  const t = useSimClock();

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-1.5 w-full h-full">
        <KeyModule t={t} compact />
        <VariationModule t={t} compact />
        <SpaceModule t={t} compact />
        <SpectrumModule t={t} compact />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl p-5 border" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[13px] font-mono tracking-[0.22em]" style={{ color: "var(--ink)" }}>
            PRODUCER MIRROR
          </h1>
          <p className="text-[10px] font-mono text-[#8a9490] mt-0.5">
            passive analysis · no judgement, just signal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
          <span className="text-[10px] font-mono text-[#8a9490]">live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ height: 480 }}>
        <KeyModule t={t} />
        <VariationModule t={t} />
        <SpaceModule t={t} />
        <SpectrumModule t={t} />
      </div>

      <p className="text-[9px] font-mono text-[#a4aba7] mt-4 text-center">
        simulated data · real version reads Live's clip/track state + master audio
      </p>
    </div>
  );
}
