import { useState, memo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ─── Chips ─────────────────────────────────────────────────── */
const CHIPS = {
  pii:     { value: "123.456.789-09",    tag: "PII",    color: "#F44336", bg: "#fef2f2" },
  masked:  { value: "***.***.**9-**",    tag: "MASKED", color: "#64748b", bg: "#f8fafc" },
  proxy:   { value: "— não armazena —", tag: "PROXY",  color: "#7c3aed", bg: "#faf5ff" },
  encrypt: { value: "AES-256 🔄",        tag: "CIFRA",  color: "#F97316", bg: "#fff7ed" },
  token:   { value: "871.234.098-61",    tag: "TOKEN",  color: "#2196F3", bg: "#eff6ff" },
};

/* ─── Category styles ────────────────────────────────────────── */
const CAT = {
  user: { bg: "#f8fafc", border: "#475569", accent: "#1e293b", tag: "USUÁRIO" },
  fe:   { bg: "#f0f9ff", border: "#0284c7", accent: "#0369a1", tag: "FRONTEND" },
  be:   { bg: "#f0fdf4", border: "#16a34a", accent: "#15803d", tag: "BACKEND" },
  mt:   { bg: "#faf5ff", border: "#7c3aed", accent: "#4c1d95", tag: "MICROTOKEN" },
  cts:  { bg: "#fafaf9", border: "#78716c", accent: "#292524", tag: "TOKEN CLUSTER", dashed: true },
  db:   { bg: "#eff6ff", border: "#93c5fd", accent: "#1e3a8a", tag: "STORAGE" },
};

/* ─── Node card ──────────────────────────────────────────────── */
const FlowNode = memo(({ data }) => {
  const c = data.cat;
  const hs = { background: c.border, width: 7, height: 7, border: `1.5px solid ${c.bg}`, opacity: 0 };

  return (
    <div style={{
      background: c.bg,
      border: c.dashed ? `2px dashed ${c.border}` : `1.5px solid ${c.border}`,
      borderRadius: 12,
      padding: "10px 14px",
      minWidth: 162,
      boxShadow: "0 1px 6px #0000000e, 0 0 0 1px #0000000a",
    }}>
      {/* ── 4 side handles: forward (top 30%) + return (bot 70%) ── */}
      <Handle type="source" position={Position.Right}  id="r-fwd" style={{ ...hs, top: "28%" }} />
      <Handle type="target" position={Position.Left}   id="l-fwd" style={{ ...hs, top: "28%" }} />
      <Handle type="source" position={Position.Left}   id="l-ret" style={{ ...hs, top: "72%" }} />
      <Handle type="target" position={Position.Right}  id="r-ret" style={{ ...hs, top: "72%" }} />
      {/* ── vertical: down-send (left) / up-recv (right) ── */}
      <Handle type="source" position={Position.Bottom} id="b-send" style={{ ...hs, left: "38%" }} />
      <Handle type="target" position={Position.Bottom} id="b-recv" style={{ ...hs, left: "62%" }} />
      <Handle type="target" position={Position.Top}    id="t-recv" style={{ ...hs, left: "38%" }} />
      <Handle type="source" position={Position.Top}    id="t-send" style={{ ...hs, left: "62%" }} />

      <div style={{
        fontSize: 9, fontWeight: 800, color: c.border,
        letterSpacing: "0.1em", marginBottom: 6,
        textTransform: "uppercase", opacity: 0.8,
      }}>
        {c.tag}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: "#fff", background: c.border,
          borderRadius: 5, padding: "1px 5px",
          fontFamily: "'DM Mono','Fira Code',monospace",
          letterSpacing: "0.04em", flexShrink: 0,
        }}>
          {data.icon}
        </span>
        <span style={{
          fontWeight: 700, fontSize: 12.5, color: c.accent,
          lineHeight: 1.25, fontFamily: "'Inter',sans-serif",
        }}>
          {data.label}
        </span>
      </div>

      {data.sub && (
        <div style={{
          fontSize: 10, color: c.border, opacity: 0.65,
          fontFamily: "'DM Mono','Fira Code',monospace",
          marginLeft: 1,
        }}>
          {data.sub}
        </div>
      )}

      {data.chip && (() => {
        const ch = CHIPS[data.chip];
        return (
          <div style={{
            marginTop: 8, background: ch.bg,
            border: `1px solid ${ch.color}30`,
            borderRadius: 6, padding: "4px 8px",
            display: "inline-flex", flexDirection: "column", gap: 1,
          }}>
            <span style={{
              fontSize: 8, fontWeight: 800, color: ch.color,
              letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8,
            }}>
              {ch.tag}
            </span>
            <span style={{
              fontFamily: "'DM Mono','Fira Code',monospace",
              fontSize: 11, fontWeight: 700, color: ch.color,
              letterSpacing: "0.04em",
            }}>
              {ch.value}
            </span>
          </div>
        );
      })()}

      {data.cluster && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "center" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#fff", border: `1px solid ${c.border}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 3px #0000000a", fontSize: 16,
            }}>
              🔒
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
FlowNode.displayName = "FlowNode";
const nodeTypes = { flow: FlowNode };

/* ─── Nodes ──────────────────────────────────────────────────── */
const NODES = [
  {
    id: "usuario", type: "flow", position: { x: 0, y: 340 },
    data: { icon: "USR", label: "Usuário", sub: "navegador", cat: CAT.user, chip: "pii" },
  },
  {
    id: "frontend", type: "flow", position: { x: 270, y: 300 },
    data: { icon: "UI", label: "React App", sub: "demo-app frontend", cat: CAT.fe, chip: "pii" },
  },
  {
    id: "backend", type: "flow", position: { x: 545, y: 300 },
    data: { icon: "API", label: "Django REST API", sub: "demoapp backend", cat: CAT.be, chip: "masked" },
  },
  {
    id: "microtoken", type: "flow", position: { x: 830, y: 260 },
    data: { icon: "MT", label: "microtoken", sub: "FastAPI · CTS proxy", cat: CAT.mt, chip: "proxy" },
  },
  {
    id: "token_cluster", type: "flow", position: { x: 1115, y: 245 },
    data: { icon: "CTS", label: "Token Cluster", sub: "Thales VTS · AES-256", cat: CAT.cts, cluster: true, chip: "encrypt" },
  },
  {
    id: "postgresql", type: "flow", position: { x: 545, y: 575 },
    data: { icon: "DB", label: "PostgreSQL", sub: "apenas tokens", cat: CAT.db, chip: "token" },
  },
];

/* ─── Edge builder ───────────────────────────────────────────── */
function e(id, src, sh, tgt, th, color, label) {
  return {
    id, source: src, sourceHandle: sh, target: tgt, targetHandle: th,
    animated: true, type: "smoothstep",
    label,
    labelStyle: { fill: "#fff", fontSize: 9.5, fontWeight: 700, fontFamily: "'DM Mono','Fira Code',monospace" },
    labelBgStyle: { fill: color, stroke: "none", rx: 4, ry: 4 },
    labelBgPadding: [3, 7],
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 13, height: 13 },
    style: { stroke: color, strokeWidth: 2 },
  };
}

/*
  ── TOKENIZAÇÃO ──────────────────────────────────────────────────────────
  Caminho de IDA (→, usa r-fwd → l-fwd, parte superior do nó)
    ① PII viaja do usuário até o backend
    ③ PII viaja do microtoken ao Token Cluster (CTS tokeniza)
  Caminho de RESPOSTA (←, usa l-ret → r-ret, parte inferior do nó)
    ⑤ token gerado volta do CTS ao backend via microtoken
    ⑦ dado mascarado volta ao usuário
  Caminho VERTICAL (↓)
    ⑥ backend salva token no PostgreSQL
*/
const TOKENIZE_EDGES = [
  // ── IDA: PII fluindo (verde) ──────────────────────
  e("t1", "usuario",       "r-fwd", "frontend",      "l-fwd", "#4CAF50", "① CPF"),
  e("t2", "frontend",      "r-fwd", "backend",       "l-fwd", "#4CAF50", "② CPF"),
  // backend chama microtoken para tokenizar
  e("t3", "backend",       "r-fwd", "microtoken",    "l-fwd", "#F44336", "③ /tokenize"),
  // microtoken encaminha PII ao CTS
  e("t4", "microtoken",    "r-fwd", "token_cluster", "l-fwd", "#4CAF50", "④ CPF"),

  // ── RESPOSTA: token voltando (amarelo) ────────────
  e("t5", "token_cluster", "l-ret", "microtoken",    "r-ret", "#FFC107", "⑤ token"),
  e("t6", "microtoken",    "l-ret", "backend",       "r-ret", "#FFC107", "⑥ token"),

  // ── VERTICAL: backend persiste token no DB ────────
  e("t7", "backend",       "b-send","postgresql",    "t-recv","#F44336", "⑦ salvar"),

  // ── RETORNO MASCARADO ao usuário (azul) ───────────
  e("t8", "backend",       "l-ret", "frontend",      "r-ret", "#2196F3", "⑧ mascarado"),
  e("t9", "frontend",      "l-ret", "usuario",       "r-ret", "#2196F3", "⑨ mascarado"),
];

/*
  ── DESTOKENIZAÇÃO ───────────────────────────────────────────────────────
  Caminho de IDA (→, parte superior)
    ① requisição do usuário até o backend
    ④ backend chama microtoken /detokenize com o token
    ⑤ microtoken encaminha token ao CTS
  Caminho DB (↕ vertical)
    ③ backend lê token do PostgreSQL (down=query, up=token retornado)
  Caminho de RESPOSTA (←, parte inferior)
    ⑥ CTS devolve PII pelo caminho inverso até o usuário
*/
const DETOKENIZE_EDGES = [
  // ── IDA: requisição do usuário (azul) ────────────
  e("d1", "usuario",       "r-fwd", "frontend",      "l-fwd", "#2196F3", "① consulta"),
  e("d2", "frontend",      "r-fwd", "backend",       "l-fwd", "#2196F3", "② consulta"),

  // ── VERTICAL: backend lê token no DB ─────────────
  e("d3", "backend",       "b-send","postgresql",    "t-recv","#F44336", "③ buscar"),
  e("d4", "postgresql",    "t-send","backend",       "b-recv","#FFC107", "④ token"),

  // ── backend chama microtoken /detokenize (vermelho)
  e("d5", "backend",       "r-fwd", "microtoken",    "l-fwd", "#F44336", "⑤ /detokenize"),
  // microtoken encaminha token ao CTS
  e("d6", "microtoken",    "r-fwd", "token_cluster", "l-fwd", "#F44336", "⑥ token"),

  // ── RESPOSTA: PII voltando pelo caminho inverso (verde) ──
  e("d7", "token_cluster", "l-ret", "microtoken",    "r-ret", "#4CAF50", "⑦ CPF"),
  e("d8", "microtoken",    "l-ret", "backend",       "r-ret", "#4CAF50", "⑧ CPF"),
  e("d9", "backend",       "l-ret", "frontend",      "r-ret", "#4CAF50", "⑨ CPF"),
  e("dA", "frontend",      "l-ret", "usuario",       "r-ret", "#4CAF50", "⑩ CPF"),
];

/* ─── Legends ────────────────────────────────────────────────── */
const LEGENDS = {
  tokenize: [
    { color: "#4CAF50", label: "🟢 PII em trânsito" },
    { color: "#F44336", label: "🔴 Pedido de serviço" },
    { color: "#FFC107", label: "🟡 Token gerado" },
    { color: "#2196F3", label: "🔵 Dado mascarado" },
  ],
  detokenize: [
    { color: "#2196F3", label: "🔵 Requisição do usuário" },
    { color: "#F44336", label: "🔴 Pedido de serviço" },
    { color: "#FFC107", label: "🟡 Token em trânsito" },
    { color: "#4CAF50", label: "🟢 PII retornando" },
  ],
};

/* ─── Main ───────────────────────────────────────────────────── */
export default function ArquiteturaFlow() {
  const [mode, setMode] = useState("tokenize");
  const [nodes] = useNodesState(NODES);
  const [, , ] = useEdgesState([]);

  const edges = mode === "tokenize" ? TOKENIZE_EDGES : DETOKENIZE_EDGES;

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#f0f2f5", fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        height: 56, flexShrink: 0,
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "0 1.75rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px #0000000a",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#16a34a", boxShadow: "0 0 0 3px #16a34a25",
          }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", letterSpacing: "-0.01em" }}>
            Arquitetura de Tokenização
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>
            microtoken · Thales VTS
          </span>
        </div>
        <a href="/gerenciar" style={{
          fontSize: 12, fontWeight: 600, color: "#64748b",
          textDecoration: "none", padding: "4px 12px",
          border: "1px solid #e2e8f0", borderRadius: 7,
          background: "#f8fafc",
        }}>
          ← Voltar
        </a>
      </div>

      {/* ── Mode toggle ── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderBottom: "1px solid #f1f5f9",
        padding: "0.55rem 1.75rem",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4,
        }}>
          Fluxo:
        </span>
        {[
          { id: "tokenize",   label: "Tokenização",    accent: "#16a34a", desc: "PII entra → token armazenado" },
          { id: "detokenize", label: "Destokenização", accent: "#7c3aed", desc: "token lido → PII retorna" },
        ].map(({ id, label, accent, desc }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            style={{
              padding: "5px 14px", borderRadius: 7, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
              border: `1.5px solid ${mode === id ? accent : "#e2e8f0"}`,
              background: mode === id ? `${accent}12` : "transparent",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 12, color: mode === id ? accent : "#94a3b8" }}>
              {label}
            </span>
            <span style={{ fontSize: 10, color: mode === id ? `${accent}99` : "#cbd5e1" }}>
              {desc}
            </span>
          </button>
        ))}
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={false}
          panOnDrag={false}
          zoomOnDoubleClick={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#d1d5db" />
        </ReactFlow>
      </div>

      {/* ── Footer legend ── */}
      <div style={{
        flexShrink: 0, background: "#fff",
        borderTop: "1px solid #e2e8f0",
        padding: "9px 1.75rem",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 28, flexWrap: "wrap",
      }}>
        {LEGENDS[mode].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <svg width="24" height="8">
              <line x1="0" y1="4" x2="24" y2="4"
                stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
        <span style={{ fontSize: 11, color: "#94a3b8" }}>
          ① → ⑨ indica sequência do fluxo
        </span>
      </div>
    </div>
  );
}
