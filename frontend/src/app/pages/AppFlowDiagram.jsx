import { useState, useCallback, useEffect, useRef, memo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/* ─── Category palette ─── */
const CAT = {
  frontend:   { bg: "#060d1a", border: "#3b82f6", accent: "#93c5fd", tag: "FRONTEND" },
  backend:    { bg: "#040d04", border: "#22c55e", accent: "#86efac", tag: "BACKEND" },
  microtoken: { bg: "#130228", border: "#a855f7", accent: "#e9d5ff", tag: "CTS MICROTOKEN", big: true },
  cts:        { bg: "#1a0c00", border: "#f59e0b", accent: "#fde68a", tag: "THALES VTS" },
  storage:    { bg: "#080e1a", border: "#475569", accent: "#94a3b8", tag: "STORAGE" },
};

/* ─── Side-panel content ─── */
const NODE_INFO = {
  "react-app": {
    cat: CAT.frontend, icon: "UI",
    title: "React App",
    desc: "Interface do demo-app. O usuario preenche dados PII (CPF, endereco, beneficios) que sao enviados em plaintext ao Django via HTTPS.",
    facts: [
      "Dados PII enviados em plaintext para o Django REST API",
      "Comunicacao via HTTPS — dados protegidos em transito",
      "Nunca armazena dados sensiveis localmente",
    ],
  },
  "django-api": {
    cat: CAT.backend, icon: "API",
    title: "Django REST API",
    desc: "API principal do demo-app. Recebe PII, chama o MicroToken para tokenizar e salva apenas o token retornado. Nunca persiste PII em plaintext.",
    facts: [
      "Nunca armazena PII em plaintext",
      "Delega tokenizacao ao MicroToken via HTTP interno",
      "Persiste apenas tokens opacos no PostgreSQL",
      "Suporta: cpf, rg, email, phone, bank, cnpj, endereco, nascimento",
    ],
  },
  "postgres": {
    cat: CAT.storage, icon: "DB",
    title: "PostgreSQL (demo-app)",
    desc: "Banco do demo-app. Contem APENAS tokens opacos. Um atacante com acesso total ao banco nao consegue extrair dados sensiveis.",
    facts: [
      "Zero PII em plaintext",
      "Tokens opacos sem valor fora do contexto CTS",
      "Violacao do banco nao expoe dados reais",
    ],
  },
  "microtoken-api": {
    cat: CAT.microtoken, icon: "MT",
    title: "MicroToken Service",
    desc: "Servico FastAPI que atua como proxy seguro entre o Django e o CTS Thales/Vormetric. Gerencia credenciais separadas por tipo de dado e roteia chamadas de tokenizacao e detokenizacao.",
    facts: [
      "FastAPI — proxy seguro para o CTS Thales VTS",
      "Credenciais separadas por tipo (cpf, cnpj, endereco...)",
      "Endpoints: POST /tokenize/{type} e /detokenize/{type}",
      "Dado sensivel jamais e logado ou mantido em memoria",
      "Token group e token template configuraveis por ambiente",
    ],
    highlight: true,
  },
  "cts-engine": {
    cat: CAT.cts, icon: "CTS",
    title: "CTS Engine (Thales VTS)",
    desc: "Motor de criptografia do Thales Vormetric Tokenization Server. Executa tokenizacao via AES-256 com token templates que preservam o formato do dado original.",
    facts: [
      "Algoritmo: AES-256 (format-preserving encryption)",
      "Token templates — formato preservado (ex: CPF <-> token no formato CPF)",
      "Endpoint: POST /vts/rest/v2.0/tokenize | /vts/rest/v2.0/detokenize",
      "Dado original jamais retorna em plaintext sem permissao explicita",
    ],
    highlight: true,
  },
  "token-vault": {
    cat: CAT.cts, icon: "VLT",
    title: "Token Vault",
    desc: "Vault interno do CTS com os mapeamentos token <-> dado real criptografado. Acessivel somente via autenticacao CTS com as credenciais do token group correto.",
    facts: [
      "Mapeamentos token <-> dado criptografado em AES-256",
      "Acesso controlado por token group e usuario CTS",
      "Cada tipo de dado tem credenciais de acesso separadas",
      "Dado real NUNCA sai daqui sem autorizacao do CTS",
    ],
    highlight: true,
  },
  "key-mgmt": {
    cat: CAT.cts, icon: "KEY",
    title: "Key Management",
    desc: "Gerenciamento de chaves AES-256 do CTS. As chaves ficam isoladas do vault e do MicroToken. Rotacao de chaves transparente para os sistemas cliente.",
    facts: [
      "Chaves AES-256 isoladas do vault e do MicroToken",
      "Rotacao de chaves sem impacto nos clientes",
      "Suporte a HSM (Hardware Security Module)",
    ],
    highlight: true,
  },
  "cts-storage": {
    cat: CAT.storage, icon: "STR",
    title: "CTS Storage",
    desc: "Armazenamento persistente do CTS. Contem dados reais criptografados em AES-256. Fisicamente separado do banco do demo-app.",
    facts: [
      "Dados reais criptografados em AES-256",
      "Separado fisicamente do banco do demo-app",
      "Acesso exclusivo via CTS Engine com autenticacao valida",
    ],
  },
};

/* ─── Custom node component ─── */
const FlowNode = memo(({ data }) => {
  const c = data.cat;
  return (
    <div style={{
      background: c.bg,
      border: `${data.highlight ? 2 : 1.5}px solid ${c.border}`,
      borderRadius: 12,
      padding: data.big ? "14px 18px" : "10px 14px",
      minWidth: data.big ? 195 : 155,
      boxShadow: data.highlight
        ? `0 0 18px ${c.border}35, 0 4px 12px #00000070`
        : "0 2px 8px #00000060",
      cursor: "pointer",
    }}>
      <Handle type="target"  position={Position.Left}   id="l-top" style={{ top: "30%", background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="target"  position={Position.Right}  id="r-bot" style={{ top: "70%", background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="source"  position={Position.Right}  id="r-top" style={{ top: "30%", background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="source"  position={Position.Left}   id="l-bot" style={{ top: "70%", background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="source"  position={Position.Bottom} id="bottom" style={{ background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="target"  position={Position.Top}    id="top"    style={{ background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="source"  position={Position.Right}  id="right"  style={{ top: "50%", background: c.border, width: 7, height: 7, opacity: 0 }} />
      <Handle type="target"  position={Position.Left}   id="left"   style={{ top: "50%", background: c.border, width: 7, height: 7, opacity: 0 }} />

      <div style={{ fontSize: 9, fontWeight: 800, color: c.border, letterSpacing: "0.1em", marginBottom: 5, textTransform: "uppercase" }}>{c.tag}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: c.bg,
          background: c.border, borderRadius: 4,
          padding: data.big ? "2px 6px" : "1px 5px",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}>{data.icon}</span>
        <span style={{ fontWeight: 700, fontSize: data.big ? 13.5 : 12, color: c.accent, lineHeight: 1.25, fontFamily: "'Lexend', sans-serif" }}>
          {data.label}
        </span>
      </div>
      {data.sub && (
        <div style={{ fontSize: 10, color: c.border, opacity: 0.75, fontFamily: "'DM Mono', monospace", marginLeft: 1 }}>{data.sub}</div>
      )}
    </div>
  );
});
FlowNode.displayName = "FlowNode";

const nodeTypes = { flow: FlowNode };

/* ─── Nodes ─── */
const INITIAL_NODES = [
  {
    id: "react-app", type: "flow", position: { x: 0, y: 235 },
    data: { ...NODE_INFO["react-app"], label: "React App", sub: "demo-app UI", cat: CAT.frontend },
  },
  {
    id: "django-api", type: "flow", position: { x: 285, y: 235 },
    data: { ...NODE_INFO["django-api"], label: "Django REST API", sub: "demoapp backend", cat: CAT.backend },
  },
  {
    id: "postgres", type: "flow", position: { x: 285, y: 435 },
    data: { ...NODE_INFO["postgres"], label: "PostgreSQL", sub: "apenas tokens", cat: CAT.storage },
  },
  {
    id: "microtoken-api", type: "flow", position: { x: 565, y: 180 },
    data: { ...NODE_INFO["microtoken-api"], label: "MicroToken Service", sub: "FastAPI · CTS proxy", cat: CAT.microtoken, big: true, highlight: true },
  },
  {
    id: "cts-engine", type: "flow", position: { x: 890, y: 75 },
    data: { ...NODE_INFO["cts-engine"], label: "CTS Engine", sub: "AES-256 · Thales VTS", cat: CAT.cts, highlight: true },
  },
  {
    id: "token-vault", type: "flow", position: { x: 890, y: 265 },
    data: { ...NODE_INFO["token-vault"], label: "Token Vault", sub: "token <-> dado real", cat: CAT.cts, highlight: true },
  },
  {
    id: "key-mgmt", type: "flow", position: { x: 890, y: 435 },
    data: { ...NODE_INFO["key-mgmt"], label: "Key Management", sub: "chaves AES-256", cat: CAT.cts, highlight: true },
  },
  {
    id: "cts-storage", type: "flow", position: { x: 1190, y: 235 },
    data: { ...NODE_INFO["cts-storage"], label: "CTS Storage", sub: "dados reais criptografados", cat: CAT.storage },
  },
];

/* ─── Edge definitions ─── */
const ALL_EDGES = [
  // Tokenization flow
  { id: "t1", source: "react-app",      sourceHandle: "r-top", target: "django-api",     targetHandle: "l-top", label: "dados PII plaintext",              flow: "tokenize" },
  { id: "t2", source: "django-api",     sourceHandle: "r-top", target: "microtoken-api", targetHandle: "l-top", label: "solicita tokenizacao",             flow: "tokenize" },
  { id: "t3", source: "microtoken-api", sourceHandle: "r-top", target: "cts-engine",     targetHandle: "l-top", label: "POST /vts/rest/v2.0/tokenize",     flow: "tokenize" },
  { id: "t4", source: "cts-engine",     sourceHandle: "bottom",target: "token-vault",    targetHandle: "top",   label: "armazena mapeamento",              flow: "tokenize" },
  { id: "t5", source: "cts-engine",     sourceHandle: "l-bot", target: "microtoken-api", targetHandle: "r-bot", label: "token opaco gerado",               flow: "tokenize" },
  { id: "t6", source: "microtoken-api", sourceHandle: "l-bot", target: "django-api",     targetHandle: "r-bot", label: "retorna token",                    flow: "tokenize" },
  { id: "t7", source: "django-api",     sourceHandle: "bottom",target: "postgres",       targetHandle: "top",   label: "persiste token (sem PII)",         flow: "tokenize" },

  // Detokenization flow
  { id: "d1", source: "django-api",     sourceHandle: "r-top", target: "microtoken-api", targetHandle: "l-top", label: "solicita detokenizacao",           flow: "detokenize" },
  { id: "d2", source: "microtoken-api", sourceHandle: "r-top", target: "cts-engine",     targetHandle: "l-top", label: "POST /vts/rest/v2.0/detokenize",   flow: "detokenize" },
  { id: "d3", source: "cts-engine",     sourceHandle: "bottom",target: "token-vault",    targetHandle: "top",   label: "busca mapeamento",                 flow: "detokenize" },
  { id: "d4", source: "cts-engine",     sourceHandle: "l-bot", target: "microtoken-api", targetHandle: "r-bot", label: "dado descriptografado",            flow: "detokenize" },
  { id: "d5", source: "microtoken-api", sourceHandle: "l-bot", target: "django-api",     targetHandle: "r-bot", label: "retorna dado original",            flow: "detokenize" },
  { id: "d6", source: "django-api",     sourceHandle: "l-bot", target: "react-app",      targetHandle: "r-bot", label: "exibe dado ao usuario",            flow: "detokenize" },

  // Structural
  { id: "s1", source: "key-mgmt",   sourceHandle: "top",   target: "cts-engine",  targetHandle: "bottom", label: "chaves AES-256",       flow: "structural" },
  { id: "s2", source: "cts-engine", sourceHandle: "right", target: "cts-storage", targetHandle: "left",   label: "dados criptografados", flow: "structural" },
];

const TOKENIZE_SEQUENCE   = ["t1", "t2", "t3", "t4", "t5", "t6", "t7"];
const DETOKENIZE_SEQUENCE = ["d1", "d2", "d3", "d4", "d5", "d6"];

/* ─── Compute styled edges ─── */
function computeEdges(mode, activeEdgeIds) {
  return ALL_EDGES.map((e) => {
    const isActive    = activeEdgeIds.has(e.id);
    const isRelevant  = e.flow === "structural" || mode === null || e.flow === mode;
    const flowColor   = e.flow === "tokenize" ? "#06b6d4" : e.flow === "detokenize" ? "#fb923c" : "#64748b";
    const opacity     = isActive ? 1 : isRelevant ? (mode === null ? 0.28 : 0.38) : 0.05;

    return {
      ...e,
      type: "smoothstep",
      animated: isActive,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isActive ? flowColor : (isRelevant ? flowColor : "#1e293b"),
        width: 14,
        height: 14,
      },
      style: {
        stroke: isActive ? flowColor : (isRelevant ? flowColor : "#1e293b"),
        opacity,
        strokeWidth: isActive ? 3 : 1.5,
      },
      labelStyle: {
        fill: isActive ? "#f1f5f9" : (isRelevant ? "#64748b" : "transparent"),
        fontSize: 10,
        fontWeight: isActive ? 700 : 400,
        fontFamily: "'DM Mono', monospace",
      },
      labelBgStyle: {
        fill: "#020617",
        opacity: isActive ? 0.97 : (isRelevant ? 0.82 : 0),
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [4, 7],
    };
  });
}

/* ─── Side panel ─── */
function NodePanel({ nodeId, onClose }) {
  const info = NODE_INFO[nodeId];
  if (!info) return null;
  const c = info.cat;
  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 310,
      background: "#08101e", borderLeft: `2px solid ${c.border}`,
      overflowY: "auto", zIndex: 10, padding: "1.5rem",
      boxShadow: "-12px 0 32px #00000070",
      animation: "fd-slide-in 0.22s cubic-bezier(0.22,1,0.36,1) both",
    }}>
      <button
        onClick={onClose}
        style={{ float: "right", background: "transparent", border: "1px solid #1e293b", borderRadius: 6, color: "#64748b", cursor: "pointer", padding: "2px 9px", fontSize: 13, lineHeight: 1.6 }}
      >x</button>

      <div style={{ fontSize: 9, fontWeight: 800, color: c.border, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{c.tag}</div>
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: c.border, color: c.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>{info.icon}</div>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: c.accent, marginBottom: 10, fontFamily: "'Lexend', sans-serif", lineHeight: 1.3 }}>{info.title}</h2>
      <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.65, marginBottom: 16, fontFamily: "'Source Sans 3', sans-serif" }}>{info.desc}</p>

      <div style={{ borderTop: "1px solid #0f172a", paddingTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>DETALHES</div>
        {info.facts.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9, alignItems: "flex-start" }}>
            <span style={{ color: c.border, fontSize: 11, flexShrink: 0, marginTop: 2 }}>+</span>
            <span style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.55, fontFamily: "'Source Sans 3', sans-serif" }}>{f}</span>
          </div>
        ))}
      </div>

      {info.highlight && (
        <div style={{ marginTop: 16, padding: "10px 12px", background: `${c.border}12`, border: `1px solid ${c.border}35`, borderRadius: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.border }}>Dado nunca sai daqui em plaintext</span>
        </div>
      )}
    </div>
  );
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@700;800&family=Source+Sans+3:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.fd-root { height: 100vh; overflow: hidden; background: #030712; color: #f1f5f9; font-family: 'Source Sans 3', sans-serif; display: flex; flex-direction: column; }
.fd-govbar { height: 5px; background: linear-gradient(90deg,#FFCD07 0%,#FFCD07 25%,#1351B4 25%); flex-shrink: 0; }
.fd-header { background: #071D41; border-bottom: 2px solid #1351B4; padding: 0 2rem; height: 58px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; gap: 1rem; }
.fd-header-left { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.fd-govbr-badge { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 0.3rem 0.75rem; flex-shrink: 0; }
.fd-govbr-star { width: 22px; height: 22px; background: #FFCD07; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 800; color: #071D41; }
.fd-govbr-label { font-family: 'Lexend', sans-serif; font-size: 0.8125rem; font-weight: 700; color: #fff; }
.fd-title { font-family: 'Lexend', sans-serif; font-size: 0.85rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fd-sub { font-size: 0.65rem; color: rgba(255,255,255,0.4); }
.fd-back { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.875rem; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); border-radius: 7px; color: rgba(255,255,255,0.7); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: none; font-family: 'Source Sans 3', sans-serif; transition: all 0.15s; flex-shrink: 0; }
.fd-back:hover { background: rgba(255,255,255,0.13); color: #fff; }
.fd-fullscreen-btn { padding: 0.3rem 0.65rem; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.13); border-radius: 7px; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; font-family: 'Source Sans 3', sans-serif; font-weight: 600; transition: all 0.15s; }
.fd-fullscreen-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

.fd-controls { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 1.5rem; background: #07101f; border-bottom: 1px solid #0f1f35; flex-shrink: 0; flex-wrap: wrap; }
.fd-ctrl-label { font-size: 0.7rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
.fd-mode-btn { padding: 0.35rem 0.9rem; border-radius: 7px; border: 1.5px solid; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.18s; font-family: 'Source Sans 3', sans-serif; }
.fd-mode-btn.tok { border-color: #0e7490; color: #67e8f9; background: transparent; }
.fd-mode-btn.tok:hover, .fd-mode-btn.tok.active { background: #06b6d415; color: #22d3ee; border-color: #22d3ee; box-shadow: 0 0 10px #22d3ee25; }
.fd-mode-btn.det { border-color: #9a3412; color: #fdba74; background: transparent; }
.fd-mode-btn.det:hover, .fd-mode-btn.det.active { background: #fb923c15; color: #fb923c; border-color: #fb923c; box-shadow: 0 0 10px #fb923c25; }
.fd-demo-btn { padding: 0.35rem 1.1rem; border-radius: 7px; border: 1.5px solid #7c3aed; color: #c4b5fd; background: transparent; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.18s; font-family: 'Source Sans 3', sans-serif; }
.fd-demo-btn:hover:not(:disabled) { background: #7c3aed18; box-shadow: 0 0 10px #7c3aed28; color: #ddd6fe; }
.fd-demo-btn:disabled { opacity: 0.38; cursor: not-allowed; }
.fd-reset-btn { padding: 0.35rem 0.8rem; border-radius: 7px; border: 1.5px solid #1e293b; color: #475569; background: transparent; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'Source Sans 3', sans-serif; }
.fd-reset-btn:hover { border-color: #334155; color: #64748b; }
.fd-sep { width: 1px; height: 18px; background: #0f1f35; flex-shrink: 0; }
.fd-legend { margin-left: auto; display: flex; align-items: center; gap: 1.1rem; flex-wrap: wrap; }
.fd-leg-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.7rem; color: #475569; white-space: nowrap; }
.fd-leg-line { width: 22px; height: 2px; border-radius: 2px; }

.fd-canvas { flex: 1; position: relative; min-height: 0; }

@keyframes fd-slide-in { from { transform: translateX(18px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

.react-flow__background { background: #030712 !important; }
.react-flow__controls { background: #0a1022 !important; border: 1px solid #1e293b !important; border-radius: 8px !important; overflow: hidden; box-shadow: 0 4px 16px #00000070 !important; }
.react-flow__controls-button { background: #0a1022 !important; border-color: #1e293b !important; color: #64748b !important; fill: #64748b !important; }
.react-flow__controls-button:hover { background: #131e35 !important; color: #94a3b8 !important; fill: #94a3b8 !important; }
.react-flow__controls-button svg { fill: currentColor !important; }
.react-flow__minimap { background: #07101f !important; border: 1px solid #1e293b !important; border-radius: 8px !important; overflow: hidden; }
.react-flow__attribution { display: none !important; }
.react-flow__node.selected > div { outline: 2px solid #a855f7 !important; outline-offset: 2px; }
`;

/* ─── Main component ─── */
export default function AppFlowDiagram() {
  const [mode, setMode]            = useState("tokenize");
  const [activeEdgeIds, setActive] = useState(new Set());
  const [demoRunning, setRunning]  = useState(false);
  const [selectedNodeId, setNode]  = useState(null);
  const timers = useRef([]);

  const [nodes] = useNodesState(INITIAL_NODES);
  const [edges, setEdges] = useEdgesState(() => computeEdges("tokenize", new Set()));

  useEffect(() => {
    setEdges(computeEdges(mode, activeEdgeIds));
  }, [mode, activeEdgeIds, setEdges]);

  const startDemo = useCallback(() => {
    if (demoRunning) return;
    timers.current.forEach(clearTimeout);
    setActive(new Set());
    setRunning(true);

    const seq = mode === "tokenize" ? TOKENIZE_SEQUENCE : DETOKENIZE_SEQUENCE;
    const ids = seq.map((id, i) =>
      setTimeout(() => setActive((prev) => new Set([...prev, id])), (i + 1) * 1100)
    );
    ids.push(setTimeout(() => setRunning(false), (seq.length + 2) * 1100));
    timers.current = ids;
  }, [mode, demoRunning]);

  const resetDemo = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setActive(new Set());
    setRunning(false);
  }, []);

  const switchMode = useCallback((m) => {
    timers.current.forEach(clearTimeout);
    setActive(new Set());
    setRunning(false);
    setMode(m);
    setNode(null);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    setNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="fd-root">
        <div className="fd-govbar" />

        <header className="fd-header">
          <div className="fd-header-left">
            <div className="fd-govbr-badge">
              <div className="fd-govbr-star">*</div>
              <span className="fd-govbr-label">gov</span>
            </div>
            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.14)", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div className="fd-title">Arquitetura MicroToken — CTS Thales/Vormetric</div>
              <div className="fd-sub">Fluxo interativo de tokenizacao e detokenizacao de dados PII</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <button onClick={toggleFullscreen} className="fd-fullscreen-btn">[ ]</button>
            <a href="/gerenciar" className="fd-back">← Admin</a>
          </div>
        </header>

        <div className="fd-controls">
          <span className="fd-ctrl-label">Fluxo:</span>
          <button className={`fd-mode-btn tok ${mode === "tokenize" ? "active" : ""}`} onClick={() => switchMode("tokenize")}>
            Tokenizacao
          </button>
          <button className={`fd-mode-btn det ${mode === "detokenize" ? "active" : ""}`} onClick={() => switchMode("detokenize")}>
            Detokenizacao
          </button>
          <div className="fd-sep" />
          <button className="fd-demo-btn" onClick={startDemo} disabled={demoRunning}>
            {demoRunning ? "Executando..." : "Iniciar Demo"}
          </button>
          <button className="fd-reset-btn" onClick={resetDemo}>Resetar</button>

          <div className="fd-legend">
            <div className="fd-leg-item">
              <div className="fd-leg-line" style={{ background: "#06b6d4" }} />
              <span>Tokenizacao</span>
            </div>
            <div className="fd-leg-item">
              <div className="fd-leg-line" style={{ background: "#fb923c" }} />
              <span>Detokenizacao</span>
            </div>
            <div className="fd-leg-item">
              <div className="fd-leg-line" style={{ background: "#64748b" }} />
              <span>Estrutural</span>
            </div>
            <div className="fd-leg-item" style={{ color: "#334155", fontSize: "0.68rem" }}>
              Clique em um no para detalhes
            </div>
          </div>
        </div>

        <div className="fd-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#111827" />
            <Controls showInteractive={false} position="bottom-left" />
            <MiniMap
              nodeColor={(n) => NODE_INFO[n.id]?.cat.border ?? "#334155"}
              maskColor="#03071299"
              style={{ bottom: 14, right: selectedNodeId ? 326 : 14 }}
            />
          </ReactFlow>

          {selectedNodeId && (
            <NodePanel nodeId={selectedNodeId} onClose={() => setNode(null)} />
          )}
        </div>
      </div>
    </>
  );
}
