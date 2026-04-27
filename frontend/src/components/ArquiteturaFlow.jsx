import { useState, useMemo, memo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { User, Monitor, Server, Shield, Vault, Database } from "lucide-react";

/* ─── Node palette ───────────────────────────────────────────── */
const PALETTE = {
  usuario:    { border: "#6366f1", bg: "#eef2ff", accent: "#3730a3", Icon: User     },
  app:        { border: "#0ea5e9", bg: "#f0f9ff", accent: "#0369a1", Icon: Monitor  },
  api:        { border: "#10b981", bg: "#ecfdf5", accent: "#065f46", Icon: Server   },
  microtoken: { border: "#8b5cf6", bg: "#f5f3ff", accent: "#4c1d95", Icon: Shield   },
  cts:        { border: "#f59e0b", bg: "#fffbeb", accent: "#78350f", Icon: Vault    },
  db:         { border: "#3b82f6", bg: "#eff6ff", accent: "#1e3a8a", Icon: Database },
};

/* ─── Custom node ────────────────────────────────────────────── */
const FlowNode = memo(({ data }) => {
  const p = PALETTE[data.styleKey];
  const { Icon } = p;
  const hs = { width: 8, height: 8, background: p.border, border: `2px solid ${p.bg}`, opacity: 0 };

  return (
    <div style={{
      background: "#fff",
      border: data.highlighted ? `2px solid ${p.border}` : `1.5px solid ${p.border}22`,
      borderRadius: 14,
      padding: "18px 22px",
      minWidth: 136,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      boxShadow: data.highlighted
        ? `0 0 0 4px ${p.border}20, 0 8px 24px ${p.border}18`
        : "0 2px 8px #0000000d, 0 0 0 1px #0000000a",
      transition: "box-shadow 0.25s, border-color 0.25s",
    }}>
      {/* Forward lane — top 20% */}
      <Handle type="target" position={Position.Left}   id="l-fwd"  style={{ ...hs, top: "20%" }} />
      <Handle type="source" position={Position.Right}  id="r-fwd"  style={{ ...hs, top: "20%" }} />
      {/* Middle lane — 50% (orange detokenize path) */}
      <Handle type="target" position={Position.Left}   id="l-mid"  style={{ ...hs, top: "50%" }} />
      <Handle type="source" position={Position.Right}  id="r-mid"  style={{ ...hs, top: "50%" }} />
      {/* Return lane — bottom 80% */}
      <Handle type="source" position={Position.Left}   id="l-ret"  style={{ ...hs, top: "80%" }} />
      <Handle type="target" position={Position.Right}  id="r-ret"  style={{ ...hs, top: "80%" }} />
      {/* Vertical — bottom (tokenize: API→DB send; detokenize: API recv from DB) */}
      <Handle type="source" position={Position.Bottom} id="b-send" style={{ ...hs, left: "35%" }} />
      <Handle type="target" position={Position.Bottom} id="b-recv" style={{ ...hs, left: "65%" }} />
      {/* Vertical — top (DB: recv from API; DB: send to API) */}
      <Handle type="target" position={Position.Top}    id="t-recv" style={{ ...hs, left: "35%" }} />
      <Handle type="source" position={Position.Top}    id="t-send" style={{ ...hs, left: "65%" }} />

      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `linear-gradient(135deg, ${p.border}22 0%, ${p.border}10 100%)`,
        border: `1px solid ${p.border}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={p.border} strokeWidth={1.8} />
      </div>

      <div style={{
        fontWeight: 700, fontSize: 13, color: p.accent,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        letterSpacing: "-0.01em", textAlign: "center", lineHeight: 1.2,
      }}>
        {data.label}
      </div>

      {data.sub && (
        <div style={{
          fontSize: 9.5, color: p.border, opacity: 0.55,
          fontFamily: "'DM Mono','Fira Code',monospace", letterSpacing: "0.04em",
        }}>
          {data.sub}
        </div>
      )}
    </div>
  );
});
FlowNode.displayName = "FlowNode";
const nodeTypes = { flow: FlowNode };

/* ─── Layout (shared) ────────────────────────────────────────── */
const GAP   = 260;
const ROW_Y = 160;

const BASE_NODES = [
  { id: "usuario",    type: "flow", position: { x: 0,       y: ROW_Y       }, data: { label: "Usuário",        styleKey: "usuario"    } },
  { id: "app",        type: "flow", position: { x: GAP,     y: ROW_Y       }, data: { label: "App",            styleKey: "app"        } },
  { id: "api",        type: "flow", position: { x: GAP * 2, y: ROW_Y       }, data: { label: "API",            styleKey: "api"        } },
  { id: "microtoken", type: "flow", position: { x: GAP * 3, y: ROW_Y       }, data: { label: "Microtoken",     styleKey: "microtoken", sub: "proxy CTS" } },
  { id: "cts",        type: "flow", position: { x: GAP * 4, y: ROW_Y       }, data: { label: "CTS",            styleKey: "cts",        sub: "Thales VTS" } },
  { id: "db",         type: "flow", position: { x: GAP * 2, y: ROW_Y + 300 }, data: { label: "Banco de Dados", styleKey: "db",         sub: "só tokens"  } },
];

/* ─── Edge helper ────────────────────────────────────────────── */
function mkEdge(id, src, sh, tgt, th, color, label) {
  return {
    id, source: src, sourceHandle: sh, target: tgt, targetHandle: th,
    animated: true, type: "smoothstep",
    ...(label ? {
      label,
      labelStyle: { fill: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono','Fira Code',monospace" },
      labelBgStyle: { fill: color, stroke: "none", rx: 5, ry: 5 },
      labelBgPadding: [4, 8],
    } : {}),
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
    style: { stroke: color, strokeWidth: 2 },
  };
}

const GREEN  = "#10b981";
const ORANGE = "#f59e0b";
const RED    = "#ef4444";

/* ── Tokenização edges ───────────────────────────────────────── */
const TOKENIZE_EDGES = [
  mkEdge("t1", "usuario",    "r-fwd",  "app",        "l-fwd",  GREEN,  "CPF"),
  mkEdge("t2", "app",        "r-fwd",  "api",        "l-fwd",  GREEN,  "CPF"),
  mkEdge("t3", "api",        "r-fwd",  "microtoken", "l-fwd",  GREEN,  "CPF"),
  mkEdge("t4", "microtoken", "r-fwd",  "cts",        "l-fwd",  GREEN,  "CPF"),
  mkEdge("t5", "cts",        "l-ret",  "microtoken", "r-ret",  ORANGE, "Token"),
  mkEdge("t6", "microtoken", "l-ret",  "api",        "r-ret",  ORANGE, "Token"),
  mkEdge("t7", "api",        "b-send", "db",         "t-recv", ORANGE, "Token"),
];

/* ── Destokenização edges ────────────────────────────────────── */
const DETOKENIZE_EDGES = [
  // Red: consulta indo →
  mkEdge("d1", "usuario",    "r-fwd",  "app",        "l-fwd",  RED,    "Consulta"),
  mkEdge("d2", "app",        "r-fwd",  "api",        "l-fwd",  RED,    "Consulta"),
  mkEdge("d3", "api",        "b-send", "db",         "t-recv", RED,    "Busca"),
  // Orange: token subindo e sendo enviado ao CTS
  mkEdge("d4", "db",         "t-send", "api",        "b-recv", ORANGE, "Token"),
  mkEdge("d5", "api",        "r-mid",  "microtoken", "l-mid",  ORANGE, "Token /detokenize"),
  mkEdge("d6", "microtoken", "r-mid",  "cts",        "l-mid",  ORANGE, null),
  // Green: CPF voltando ←
  mkEdge("d7", "cts",        "l-ret",  "microtoken", "r-ret",  GREEN,  "CPF"),
  mkEdge("d8", "microtoken", "l-ret",  "api",        "r-ret",  GREEN,  "CPF"),
  mkEdge("d9", "api",        "l-ret",  "app",        "r-ret",  GREEN,  "CPF"),
  mkEdge("dA", "app",        "l-ret",  "usuario",    "r-ret",  GREEN,  "CPF"),
];

/* ─── Steps ──────────────────────────────────────────────────── */
const TOKENIZE_STEPS = [
  { nodeIds: ["usuario"],                     edgeIds: [],          label: "Usuário vai preencher o CPF no formulário do App" },
  { nodeIds: ["usuario", "app"],              edgeIds: ["t1"],      label: "Usuário preenche o CPF no App" },
  { nodeIds: ["app", "api"],                  edgeIds: ["t2"],      label: "App envia o CPF para a API" },
  { nodeIds: ["api", "microtoken"],           edgeIds: ["t3"],      label: "API manda o CPF para tokenizar no Microtoken" },
  { nodeIds: ["microtoken", "cts"],           edgeIds: ["t4"],      label: "Aqui o CPF vira Token — Microtoken envia ao CTS (Thales VTS)" },
  { nodeIds: ["cts", "microtoken"],           edgeIds: ["t5"],      label: "CTS cifra com AES-256 e devolve o Token ao Microtoken" },
  { nodeIds: ["microtoken", "api"],           edgeIds: ["t6"],      label: "Token retorna ao Microtoken e segue para a API" },
  { nodeIds: ["api", "db"],                   edgeIds: ["t7"],      label: "Aqui o Token é salvo — API persiste o Token no Banco de Dados" },
];

const DETOKENIZE_STEPS = [
  { nodeIds: ["usuario"],                           edgeIds: [],              label: "Usuário quer ver o CPF que está mascarado" },
  { nodeIds: ["usuario", "app"],                    edgeIds: ["d1"],          label: "Usuário pede para ver o CPF que está mascarado" },
  { nodeIds: ["app", "api"],                        edgeIds: ["d2"],          label: "App faz pedido de consulta para a API" },
  { nodeIds: ["api", "db"],                         edgeIds: ["d3"],          label: "API faz a busca do token no Banco de Dados" },
  { nodeIds: ["db", "api"],                         edgeIds: ["d4"],          label: "Aqui o Token é mandado para a API" },
  { nodeIds: ["api", "microtoken"],                 edgeIds: ["d5"],          label: "Mando o token ser detokenizado no Microtoken" },
  { nodeIds: ["microtoken", "cts"],                 edgeIds: ["d6"],          label: "Microtoken envia o token ao CTS para destokenizar" },
  { nodeIds: ["cts", "microtoken"],                 edgeIds: ["d7"],          label: "Aqui o Token volta a ser CPF (podendo ser mascarado ou não)" },
  { nodeIds: ["microtoken", "api"],                 edgeIds: ["d8"],          label: "CPF retorna ao Microtoken e segue para a API" },
  { nodeIds: ["api", "app"],                        edgeIds: ["d9"],          label: "API envia CPF ao App" },
  { nodeIds: ["app", "usuario"],                    edgeIds: ["dA"],          label: "App exibe o CPF ao Usuário" },
];

/* ─── Legend config ──────────────────────────────────────────── */
const LEGENDS = {
  tokenize: [
    { color: GREEN,  label: "CPF em trânsito" },
    { color: ORANGE, label: "Token gerado / salvo" },
  ],
  detokenize: [
    { color: RED,    label: "Consulta do usuário" },
    { color: ORANGE, label: "Token sendo enviado" },
    { color: GREEN,  label: "CPF retornando" },
  ],
};

/* ─── Main ───────────────────────────────────────────────────── */
export default function ArquiteturaFlow() {
  const [mode, setMode] = useState("tokenize");
  const [step, setStep] = useState(null);

  const steps = mode === "tokenize" ? TOKENIZE_STEPS : DETOKENIZE_STEPS;
  const edges = mode === "tokenize" ? TOKENIZE_EDGES : DETOKENIZE_EDGES;
  const total = steps.length;
  const cur   = step !== null ? steps[step] : null;
  const isFirst = step === null;
  const isLast  = step === total - 1;

  function switchMode(m) {
    setMode(m);
    setStep(null);
  }

  const displayedNodes = useMemo(() => {
    if (!cur) return BASE_NODES;
    const active = new Set(cur.nodeIds);
    return BASE_NODES.map((n) => ({
      ...n,
      data: { ...n.data, highlighted: active.has(n.id) },
      style: { opacity: active.has(n.id) ? 1 : 0.12, transition: "opacity 0.3s" },
    }));
  }, [cur]);

  const displayedEdges = useMemo(() => {
    if (!cur) return edges;
    const active = new Set(cur.edgeIds);
    return edges.map((edge) => {
      const on = active.has(edge.id);
      return {
        ...edge,
        animated: on,
        style: { ...edge.style, opacity: on ? 1 : 0.07, transition: "opacity 0.3s" },
        ...(edge.labelStyle ? {
          labelStyle: { ...edge.labelStyle, opacity: on ? 1 : 0 },
          labelBgStyle: { ...edge.labelBgStyle, opacity: on ? 1 : 0 },
        } : {}),
      };
    });
  }, [cur, edges]);

  /* small button factory */
  const Btn = ({ onClick, disabled, primary, children }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 16px", borderRadius: 8,
      cursor: disabled ? "default" : "pointer",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      fontSize: 12, fontWeight: 600, transition: "all 0.15s",
      opacity: disabled ? 0.3 : 1,
      background: primary && !disabled ? "#0f172a" : "#fff",
      color:      primary && !disabled ? "#fff"    : "#374151",
      border: `1.5px solid ${primary && !disabled ? "#0f172a" : "#e2e8f0"}`,
    }}>
      {children}
    </button>
  );

  const modeAccent = mode === "tokenize" ? "#10b981" : "#6366f1";

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#f1f5f9", fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        height: 56, flexShrink: 0, background: "#fff",
        borderBottom: "1px solid #e2e8f0", padding: "0 1.75rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px #0000000a",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "linear-gradient(135deg, #10b981 0%, #6366f1 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={15} color="#fff" strokeWidth={2} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Arquitetura microtoken
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "#64748b",
            background: "#f1f5f9", border: "1px solid #e2e8f0",
            borderRadius: 5, padding: "2px 8px", letterSpacing: "0.04em",
          }}>
            Thales VTS · AES-256
          </span>
        </div>
        <a href="/gerenciar" style={{
          fontSize: 12, fontWeight: 600, color: "#64748b",
          textDecoration: "none", padding: "5px 14px",
          border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc",
        }}>
          ← Voltar
        </a>
      </div>

      {/* ── Mode tabs ── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 1.75rem",
        display: "flex", alignItems: "flex-end", gap: 0,
      }}>
        {[
          { id: "tokenize",   label: "Tokenização",    accent: "#10b981", desc: "CPF entra → Token salvo" },
          { id: "detokenize", label: "Destokenização",  accent: "#6366f1", desc: "Token lido → CPF retorna" },
        ].map(({ id, label, accent, desc }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => switchMode(id)}
              style={{
                padding: "10px 20px 11px",
                cursor: "pointer",
                fontFamily: "inherit",
                background: "transparent",
                border: "none",
                borderBottom: active ? `2.5px solid ${accent}` : "2.5px solid transparent",
                marginBottom: -1,
                display: "flex", alignItems: "center", gap: 8,
                transition: "border-color 0.15s",
              }}
            >
              <span style={{
                fontWeight: 700, fontSize: 13,
                color: active ? accent : "#94a3b8",
                transition: "color 0.15s",
              }}>
                {label}
              </span>
              <span style={{
                fontSize: 10, color: active ? `${accent}99` : "#cbd5e1",
                transition: "color 0.15s",
              }}>
                {desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Step controls ── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        padding: "0.6rem 1.75rem",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Btn onClick={() => setStep((s) => (s === null || s === 0 ? null : s - 1))} disabled={isFirst}>
          ← Anterior
        </Btn>
        <Btn onClick={() => setStep((s) => (s === null ? 0 : Math.min(s + 1, total - 1)))} disabled={isLast} primary>
          Próximo →
        </Btn>
        <Btn onClick={() => setStep(null)} disabled={isFirst}>
          ↺ Reiniciar
        </Btn>

        <div style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 2px" }} />

        {/* Dots */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              title={s.label}
              style={{
                height: 6,
                width: step === i ? 24 : step !== null && i < step ? 10 : 6,
                borderRadius: 3, padding: 0, border: "none", cursor: "pointer",
                background: step === i
                  ? modeAccent
                  : step !== null && i < step
                    ? "#94a3b8"
                    : "#e2e8f0",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        <span style={{
          fontSize: 12.5, marginLeft: 6, flex: 1,
          color: cur ? "#0f172a" : "#94a3b8",
          fontWeight: cur ? 500 : 400,
        }}>
          {cur
            ? cur.label
            : "Clique em \"Próximo\" para percorrer o fluxo passo a passo"}
        </span>

        {step !== null && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#94a3b8",
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 6, padding: "2px 8px", flexShrink: 0,
          }}>
            {step + 1} / {total}
          </span>
        )}
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlow
          nodes={displayedNodes}
          edges={displayedEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 0.85 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#cbd5e1" />
        </ReactFlow>
      </div>

      {/* ── Legend ── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderTop: "1px solid #e2e8f0",
        padding: "10px 1.75rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 32,
      }}>
        {LEGENDS[mode].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="28" height="8">
              <line x1="0" y1="4" x2="22" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="18,1 28,4 18,7" fill={color} />
            </svg>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
