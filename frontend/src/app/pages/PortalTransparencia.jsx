import { useState, useRef, useEffect } from "react";
import LoginPortal from "./LoginPortal";


/* ─────────────────────────────────────────────
   MOCK DATA — AUDIT LOG
───────────────────────────────────────────── */
const INITIAL_AUDIT_LOG = [
  { id: 1, usuario: "Auditor Federal — audfed@cgu.gov", campo: "CPF", contexto: "Servidores", servidor: "Fernanda Lima de Souza", data: "20/04/2026 09:14:22", ip: "200.198.***.*12", justificativa: "Investigação de conformidade fiscal nº 2026/04782" },
  { id: 2, usuario: "Auditor Federal — audfed@cgu.gov", campo: "Endereço", contexto: "Servidores", servidor: "Fernanda Lima de Souza", data: "20/04/2026 09:14:38", ip: "200.198.***.*12", justificativa: "Investigação de conformidade fiscal nº 2026/04782" },
  { id: 3, usuario: "Controlador — ctrl@tcu.gov", campo: "CNPJ", contexto: "Contratos", servidor: "CT-2024-00142 · Tecnodata Sistemas", data: "19/04/2026 15:43:07", ip: "192.168.***.***", justificativa: "Auditoria de contratos TI — TCU 001.234/2026" },
  { id: 4, usuario: "Controlador — ctrl@tcu.gov", campo: "Dados Bancários", contexto: "Contratos", servidor: "CT-2024-00142 · Tecnodata Sistemas", data: "19/04/2026 15:44:21", ip: "192.168.***.***", justificativa: "Auditoria de contratos TI — TCU 001.234/2026" },
  { id: 5, usuario: "Analista — pj@mpf.mp.br", campo: "CPF", contexto: "Servidores", servidor: "Carlos Eduardo Nunes Braga", data: "18/04/2026 11:20:14", ip: "177.92.***.***", justificativa: "Inquérito civil nº 1.34.000.002342/2026" },
  { id: 6, usuario: "Analista — pj@mpf.mp.br", campo: "CNPJ", contexto: "Contratos", servidor: "CT-2023-00374 · Construtora Horizonte", data: "18/04/2026 11:21:33", ip: "177.92.***.***", justificativa: "Inquérito civil nº 1.34.000.002342/2026" },
  { id: 7, usuario: "Auditor — aud@cgu.gov", campo: "Benefícios", contexto: "Servidores", servidor: "João Carlos Ferreira Lima", data: "17/04/2026 08:59:01", ip: "200.198.***.***", justificativa: "Revisão de vantagens — CGU nota 2026/01123" },
  { id: 8, usuario: "Controlador — ctrl@tcu.gov", campo: "Responsável", contexto: "Contratos", servidor: "CT-2024-00211 · SecureVision", data: "16/04/2026 16:30:44", ip: "192.168.***.***", justificativa: "Auditoria segurança eletrônica — TCU 002.889/2026" },
];

const CONSULTAS = [
  { id: "servidores", titulo: "Servidores e Pensionistas", desc: "Remuneração, cargos e vínculos de servidores civis e militares do Poder Executivo Federal.", qtd: "2,1 milhões de registros" },
  { id: "contratos",  titulo: "Contratos Públicos",       desc: "Contratos firmados pela Administração Pública Federal com fornecedores e prestadores de serviço.", qtd: "890 mil contratos ativos" },
  { id: "despesas",   titulo: "Despesas Públicas",         desc: "Execução orçamentária e financeira dos órgãos e entidades do Governo Federal.", qtd: "Atualizado diariamente" },
  { id: "licitacoes", titulo: "Licitações",                desc: "Editais, resultados e homologações de processos licitatórios realizados pelo Governo Federal.", qtd: "140 mil em andamento" },
  { id: "sancoes",    titulo: "Sanções Administrativas",   desc: "Fornecedores impedidos de contratar com a Administração Pública por irregularidades.", qtd: "32 mil empresas sancionadas" },
  { id: "beneficios", titulo: "Benefícios ao Cidadão",     desc: "Transferências de renda, auxílios e programas sociais do Governo Federal.", qtd: "95 milhões de beneficiários" },
];

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pt-root {
  min-height: 100vh;
  background: #F0F2F5;
  font-family: 'Source Sans 3', sans-serif;
  color: #1A1A2E;
}

.pt-govbar {
  height: 6px;
  background: linear-gradient(90deg, #FFCD07 0%, #FFCD07 25%, #1351B4 25%);
  position: sticky; top: 0; z-index: 100;
}

/* ── Header ── */
.pt-header {
  background: #071D41;
  border-bottom: 3px solid #1351B4;
  position: sticky; top: 6px; z-index: 99;
}

.pt-header-inner {
  max-width: 1320px; margin: 0 auto; padding: 0 2rem;
  height: 72px; display: flex; align-items: center;
  justify-content: space-between; gap: 1.5rem;
}

.pt-logo-block { display: flex; align-items: center; gap: 1.25rem; }

.pt-govbr-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; padding: 0.375rem 0.875rem;
}

.pt-govbr-star {
  width: 26px; height: 26px; background: #FFCD07;
  border-radius: 50%; display: flex; align-items: center;
  justify-content: center; font-size: 0.75rem;
  font-weight: 800; color: #071D41; flex-shrink: 0;
}

.pt-govbr-label {
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem;
  font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em;
}

.pt-header-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.15); }

.pt-portal-label { display: flex; flex-direction: column; }
.pt-portal-title {
  font-family: 'Lexend', sans-serif; font-size: 1.0625rem;
  font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em; line-height: 1.2;
}
.pt-portal-sub {
  font-size: 0.75rem; color: rgba(255,255,255,0.55);
  font-weight: 400; letter-spacing: 0.01em; margin-top: 1px;
}

.pt-access-toggle {
  display: flex; align-items: center; gap: 0.25rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 0.25rem;
}

.pt-access-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.3125rem 0.75rem; border-radius: 7px; border: none;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem;
  font-weight: 600; cursor: pointer; transition: all 0.18s;
  background: transparent; color: rgba(255,255,255,0.5);
  white-space: nowrap; letter-spacing: 0.01em;
}

.pt-access-btn:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.08); }
.pt-access-btn.citizen.active { background: #4A6FA5; color: #fff; }
.pt-access-btn.auditor.active { background: #168821; color: #fff; }
.pt-access-btn.admin.active   { background: #C97B00; color: #fff; }

/* ── Nav tabs ── */
.pt-nav { background: #1351B4; }
.pt-nav-inner {
  max-width: 1320px; margin: 0 auto; padding: 0 2rem;
  display: flex; align-items: center;
}

.pt-nav-item {
  padding: 0.8125rem 1.25rem; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.65);
  cursor: pointer; border: none; background: transparent;
  transition: color 0.15s, background 0.15s;
  border-bottom: 3px solid transparent;
  letter-spacing: 0.02em; text-transform: uppercase;
}

.pt-nav-item:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.05); }
.pt-nav-item.active { color: #FFFFFF; border-bottom-color: #FFCD07; }

/* ── Main ── */
.pt-main { max-width: 1320px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }

/* ── Hero ── */
.pt-hero {
  background: linear-gradient(135deg, #071D41 0%, #1351B4 100%);
  border-radius: 16px; padding: 3rem 3rem 2.75rem;
  margin-bottom: 2.5rem; position: relative; overflow: hidden;
}

.pt-hero::before {
  content: ''; position: absolute; top: -60px; right: -60px;
  width: 280px; height: 280px; background: rgba(255,255,255,0.04); border-radius: 50%;
}
.pt-hero::after {
  content: ''; position: absolute; bottom: -40px; right: 120px;
  width: 160px; height: 160px; background: rgba(255,205,7,0.07); border-radius: 50%;
}

.pt-hero-tag {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(255,205,7,0.15); border: 1px solid rgba(255,205,7,0.3);
  border-radius: 100px; padding: 0.25rem 0.875rem;
  font-size: 0.6875rem; font-weight: 700; color: #FFCD07;
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.25rem;
}
.pt-hero-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #FFCD07; flex-shrink: 0; }

.pt-hero-title {
  font-family: 'Lexend', sans-serif; font-size: 2.125rem; font-weight: 700;
  color: #FFFFFF; letter-spacing: -0.03em; line-height: 1.2;
  margin-bottom: 0.875rem; max-width: 640px;
}

.pt-hero-desc {
  font-size: 1rem; color: rgba(255,255,255,0.7);
  line-height: 1.6; max-width: 560px; margin-bottom: 2rem;
}

.pt-hero-search {
  display: flex; max-width: 620px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  border-radius: 10px; overflow: hidden;
}

.pt-hero-search-select {
  background: #fff; border: none; border-right: 1px solid #E0E0E0;
  padding: 0 1.125rem; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.875rem; font-weight: 600; color: #1351B4;
  cursor: pointer; outline: none; flex-shrink: 0; min-width: 160px;
}

.pt-hero-search-input {
  flex: 1; background: #fff; border: none;
  padding: 0.875rem 1.125rem; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.9375rem; color: #1A1A2E; outline: none;
}
.pt-hero-search-input::placeholder { color: #9E9E9E; }

.pt-hero-search-btn {
  background: #168821; border: none; padding: 0.875rem 1.75rem;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.9375rem;
  font-weight: 700; color: #fff; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.pt-hero-search-btn:hover { background: #0D6318; }

.pt-hero-stats {
  display: flex; gap: 2.5rem; margin-top: 2.25rem;
  padding-top: 1.75rem; border-top: 1px solid rgba(255,255,255,0.1);
}
.pt-hero-stat-num {
  font-family: 'Lexend', sans-serif; font-size: 1.625rem; font-weight: 700;
  color: #FFCD07; letter-spacing: -0.03em; line-height: 1;
}
.pt-hero-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.55); margin-top: 3px; }

/* Consultas grid */
.pt-consultas-title {
  font-family: 'Lexend', sans-serif; font-size: 1.1875rem; font-weight: 700;
  color: #071D41; letter-spacing: -0.02em; margin-bottom: 1.25rem;
}

.pt-consultas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

.pt-consulta-card {
  background: #fff; border: 1px solid #E0E4ED; border-radius: 12px;
  padding: 1.5rem; cursor: pointer;
  transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
  position: relative; overflow: hidden;
}
.pt-consulta-card:hover { box-shadow: 0 6px 24px rgba(19,81,180,0.1); border-color: #1351B4; transform: translateY(-2px); }

.pt-consulta-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 4px; height: 100%; border-radius: 12px 0 0 12px;
}
.pt-consulta-card:nth-child(1)::before { background: #1351B4; }
.pt-consulta-card:nth-child(2)::before { background: #168821; }
.pt-consulta-card:nth-child(3)::before { background: #0070B8; }
.pt-consulta-card:nth-child(4)::before { background: #A01E1E; }
.pt-consulta-card:nth-child(5)::before { background: #C97B00; }
.pt-consulta-card:nth-child(6)::before { background: #168821; }

.pt-consulta-icon {
  width: 40px; height: 40px; border-radius: 10px; background: #F0F2F5;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 0.875rem; color: #1351B4;
}

.pt-consulta-titulo {
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem; font-weight: 700;
  color: #071D41; letter-spacing: -0.02em; margin-bottom: 0.375rem;
}
.pt-consulta-desc { font-size: 0.8125rem; color: #6B7280; line-height: 1.5; margin-bottom: 0.875rem; }
.pt-consulta-qtd { font-size: 0.6875rem; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.06em; }

/* ── Shared page elements ── */
.pt-page-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 1.75rem; gap: 1rem; flex-wrap: wrap;
}
.pt-page-title {
  font-family: 'Lexend', sans-serif; font-size: 1.5rem; font-weight: 700;
  color: #071D41; letter-spacing: -0.03em; line-height: 1.2;
}
.pt-page-breadcrumb {
  font-size: 0.75rem; color: #9CA3AF; margin-top: 0.25rem;
  display: flex; align-items: center; gap: 0.375rem;
}
.pt-page-breadcrumb a { color: #1351B4; text-decoration: none; font-weight: 500; }
.pt-page-breadcrumb a:hover { text-decoration: underline; }

.pt-lgpd-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: #FFF8E6; border: 1px solid #F5C842;
  border-radius: 8px; padding: 0.5rem 1rem;
  font-size: 0.75rem; font-weight: 600; color: #7A5800; flex-shrink: 0;
}

/* Filters */
.pt-filters {
  background: #fff; border: 1px solid #E0E4ED; border-radius: 12px;
  padding: 1.25rem 1.5rem; margin-bottom: 1.25rem;
  display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;
}
.pt-filter-group { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; min-width: 180px; }
.pt-filter-label { font-size: 0.6875rem; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; }
.pt-filter-input, .pt-filter-select {
  background: #F8F9FB; border: 1.5px solid #E0E4ED; border-radius: 8px;
  padding: 0.5625rem 0.875rem; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.875rem; color: #1A1A2E; outline: none; transition: border-color 0.15s; width: 100%;
}
.pt-filter-input::placeholder { color: #B0B7C3; }
.pt-filter-input:focus, .pt-filter-select:focus { border-color: #1351B4; }
.pt-filter-btn {
  padding: 0.5625rem 1.5rem; background: #1351B4; border: none; border-radius: 8px;
  color: #fff; font-family: 'Source Sans 3', sans-serif; font-size: 0.875rem;
  font-weight: 700; cursor: pointer; transition: background 0.15s;
  flex-shrink: 0; align-self: flex-end; white-space: nowrap;
}
.pt-filter-btn:hover { background: #0A3A8E; }

/* Table */
.pt-table-wrap { background: #fff; border: 1px solid #E0E4ED; border-radius: 12px; overflow: hidden; }
.pt-table-toolbar {
  padding: 1rem 1.5rem; border-bottom: 1px solid #F0F2F5;
  display: flex; align-items: center; justify-content: space-between;
}
.pt-table-count { font-size: 0.8125rem; color: #6B7280; }
.pt-table-count strong { color: #1A1A2E; }

.pt-table { width: 100%; border-collapse: collapse; }
.pt-table th {
  background: #F8F9FB; border-bottom: 2px solid #E0E4ED;
  padding: 0.8125rem 1.25rem; text-align: left;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.6875rem;
  font-weight: 700; color: #6B7280; text-transform: uppercase;
  letter-spacing: 0.08em; white-space: nowrap;
}
.pt-table td {
  padding: 1rem 1.25rem; border-bottom: 1px solid #F0F2F5;
  font-size: 0.875rem; color: #374151; vertical-align: middle;
}
.pt-table tr:last-child td { border-bottom: none; }
.pt-table tr:hover td { background: #FAFBFF; }

.pt-name-cell { display: flex; align-items: center; gap: 0.625rem; }
.pt-table-avatar {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8125rem; font-weight: 700; flex-shrink: 0;
  font-family: 'Lexend', sans-serif;
}
.pt-name-full { font-weight: 600; color: #071D41; font-size: 0.875rem; }
.pt-name-siape { font-family: 'DM Mono', monospace; font-size: 0.6875rem; color: #9CA3AF; margin-top: 1px; }
.pt-salary-cell { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #168821; font-weight: 500; }
.pt-contract-val { font-family: 'DM Mono', monospace; font-size: 0.875rem; color: #0A3A8E; font-weight: 600; }

/* Masked / Revealed */
.pt-masked {
  display: inline-flex; align-items: flex-start; gap: 0.4375rem;
  background: #EDEDED; border: 1px solid #D4D4D4; border-radius: 6px;
  padding: 0.3125rem 0.625rem; font-family: 'DM Mono', monospace;
  font-size: 0.8125rem; color: #888; letter-spacing: 0.05em;
  white-space: normal; word-break: break-word; max-width: 100%;
}

@keyframes ptReveal {
  0%   { opacity: 0; transform: translateY(2px); }
  100% { opacity: 1; transform: translateY(0); }
}

.pt-revealed {
  display: inline-flex; align-items: flex-start; gap: 0.4375rem;
  background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 6px;
  padding: 0.3125rem 0.625rem; font-family: 'DM Mono', monospace;
  font-size: 0.8125rem; color: #1B5E20; font-weight: 500;
  white-space: normal; word-break: break-word; max-width: 100%;
  animation: ptReveal 0.35s cubic-bezier(0.22,1,0.36,1) both;
}

.pt-reveal-btn {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.3125rem 0.75rem; background: transparent;
  border: 1.5px solid #1351B4; border-radius: 6px;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem;
  font-weight: 700; color: #1351B4; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.pt-reveal-btn:hover { background: #1351B4; color: #fff; }

.pt-request-btn {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.3125rem 0.75rem; background: transparent;
  border: 1.5px solid #9CA3AF; border-radius: 6px;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.75rem;
  font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.pt-request-btn:hover { border-color: #6B7280; color: #374151; background: #F9FAFB; }

.pt-requested-badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.3125rem 0.75rem; background: #FFF8E6;
  border: 1px solid #F5C842; border-radius: 6px;
  font-size: 0.75rem; font-weight: 600; color: #7A5800; white-space: nowrap;
  animation: ptReveal 0.3s ease both;
}

.pt-detail-btn {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.3125rem 0.75rem; background: #1351B4; border: none;
  border-radius: 6px; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.75rem; font-weight: 700; color: #fff; cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.pt-detail-btn:hover { background: #0A3A8E; }

/* Situação / Status badges */
.pt-status-badge {
  display: inline-flex; align-items: center; gap: 0.3125rem;
  padding: 0.1875rem 0.625rem; border-radius: 100px;
  font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.04em;
}
.pt-status-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.pt-status-badge.green  { background: #E8F5E9; border: 1px solid #A5D6A7; color: #168821; }
.pt-status-badge.green::before  { background: #168821; }
.pt-status-badge.blue   { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; }
.pt-status-badge.blue::before   { background: #1D4ED8; }
.pt-status-badge.yellow { background: #FFF8E6; border: 1px solid #F5C842; color: #7A5800; }
.pt-status-badge.yellow::before { background: #C97B00; }

/* ── Detail page ── */
.pt-back-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; background: #fff; border: 1px solid #E0E4ED;
  border-radius: 8px; font-family: 'Source Sans 3', sans-serif;
  font-size: 0.8125rem; font-weight: 600; color: #374151;
  cursor: pointer; transition: all 0.15s; margin-bottom: 1.5rem;
}
.pt-back-btn:hover { border-color: #1351B4; color: #1351B4; background: #F8F9FB; }

.pt-detail-grid {
  display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: start;
}
@media (max-width: 900px) { .pt-detail-grid { grid-template-columns: 1fr; } }

.pt-profile-card {
  background: #fff; border: 1px solid #E0E4ED;
  border-radius: 14px; overflow: hidden; position: sticky; top: 150px;
}
.pt-profile-banner { height: 72px; background: linear-gradient(135deg, #071D41 0%, #1351B4 100%); }
.pt-profile-avatar-wrap {
  position: relative; display: flex; justify-content: center;
  margin-top: -28px; margin-bottom: 0.75rem; z-index: 1;
}
.pt-profile-avatar {
  width: 56px; height: 56px; border-radius: 50%; border: 3px solid #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Lexend', sans-serif; font-size: 1.375rem; font-weight: 700;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.pt-profile-body { padding: 0 1.25rem 1.5rem; text-align: center; }
.pt-profile-name {
  font-family: 'Lexend', sans-serif; font-size: 1.0625rem; font-weight: 700;
  color: #071D41; letter-spacing: -0.02em; margin-bottom: 0.25rem; line-height: 1.3;
}
.pt-profile-cargo { font-size: 0.8125rem; color: #6B7280; margin-bottom: 0.25rem; }
.pt-profile-orgao { font-size: 0.75rem; font-weight: 600; color: #1351B4; margin-bottom: 1rem; }
.pt-profile-divider { height: 1px; background: #F0F2F5; margin: 1rem 0; }
.pt-profile-meta { display: flex; flex-direction: column; gap: 0.625rem; text-align: left; }
.pt-profile-meta-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
.pt-profile-meta-label { font-size: 0.6875rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.pt-profile-meta-val { font-size: 0.8125rem; font-weight: 600; color: #374151; text-align: right; }

/* Sections */
.pt-detail-sections { display: flex; flex-direction: column; gap: 1.25rem; }
.pt-section { background: #fff; border: 1px solid #E0E4ED; border-radius: 14px; overflow: hidden; }
.pt-section-header {
  padding: 1rem 1.5rem; border-bottom: 1px solid #F0F2F5;
  display: flex; align-items: center; gap: 0.625rem;
}
.pt-section-icon {
  width: 30px; height: 30px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pt-section-icon.blue   { background: #EFF6FF; color: #1351B4; }
.pt-section-icon.green  { background: #E8F5E9; color: #168821; }
.pt-section-icon.yellow { background: #FFF8E6; color: #C97B00; }
.pt-section-title {
  font-family: 'Lexend', sans-serif; font-size: 0.9375rem;
  font-weight: 700; color: #071D41; letter-spacing: -0.02em;
}
.pt-section-body {
  padding: 1.25rem 1.5rem;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem;
}
.pt-field { display: flex; flex-direction: column; gap: 0.3125rem; }
.pt-field-label { font-size: 0.6875rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; }
.pt-field-val { font-size: 0.9375rem; font-weight: 500; color: #374151; }
.pt-field-val.mono { font-family: 'DM Mono', monospace; font-size: 0.875rem; }
.pt-field-val.salary { font-family: 'DM Mono', monospace; font-size: 1rem; font-weight: 600; color: #168821; }
.pt-field-val.contract-val { font-family: 'DM Mono', monospace; font-size: 1rem; font-weight: 600; color: #0A3A8E; }

.pt-access-info {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.875rem 1.25rem; border-radius: 10px; margin-bottom: 1.25rem; font-size: 0.8125rem;
}
.pt-access-info.citizen { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; }
.pt-access-info.auditor { background: #E8F5E9; border: 1px solid #A5D6A7; color: #1B5E20; }
.pt-access-info.admin   { background: #FFF8E6; border: 1px solid #F5C842; color: #7A5800; }

/* ── Audit ── */
.pt-audit-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.pt-audit-stat { background: #fff; border: 1px solid #E0E4ED; border-radius: 12px; padding: 1.25rem 1.5rem; }
.pt-audit-stat-num {
  font-family: 'Lexend', sans-serif; font-size: 2rem; font-weight: 800;
  color: #071D41; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.25rem;
}
.pt-audit-stat-label { font-size: 0.8125rem; color: #6B7280; }

/* ── Modal ── */
@keyframes ptOverlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes ptModalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.pt-modal-overlay {
  position: fixed; inset: 0; background: rgba(7,29,65,0.55);
  backdrop-filter: blur(4px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
  animation: ptOverlayIn 0.2s ease both;
}
.pt-modal {
  background: #fff; border-radius: 16px; width: 100%; max-width: 440px;
  overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.22);
  animation: ptModalIn 0.25s cubic-bezier(0.22,1,0.36,1) both;
}
.pt-modal-header {
  background: linear-gradient(135deg, #071D41 0%, #1351B4 100%);
  padding: 1.5rem; display: flex; align-items: flex-start;
  justify-content: space-between; gap: 1rem;
}
.pt-modal-tag {
  display: inline-flex; align-items: center; gap: 0.375rem;
  background: rgba(255,205,7,0.15); border: 1px solid rgba(255,205,7,0.3);
  border-radius: 100px; padding: 0.1875rem 0.625rem;
  font-size: 0.625rem; font-weight: 700; color: #FFCD07;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem;
}
.pt-modal-title {
  font-family: 'Lexend', sans-serif; font-size: 1.125rem; font-weight: 700;
  color: #fff; letter-spacing: -0.02em;
}
.pt-modal-subtitle { font-size: 0.8125rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem; }
.pt-modal-close {
  width: 30px; height: 30px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2); background: transparent;
  color: rgba(255,255,255,0.6); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.125rem; flex-shrink: 0; transition: all 0.15s;
}
.pt-modal-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
.pt-modal-body { padding: 1.5rem; }
.pt-modal-info {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.75rem 1rem; background: #EFF6FF; border: 1px solid #BFDBFE;
  border-radius: 8px; margin-bottom: 1.25rem; font-size: 0.8125rem; color: #1D4ED8;
}
.pt-modal-field-info { margin-bottom: 1.25rem; }
.pt-modal-field-label { font-size: 0.6875rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.375rem; }
.pt-modal-field-name { font-size: 0.9375rem; font-weight: 600; color: #071D41; }
.pt-modal-input-label { font-size: 0.8125rem; font-weight: 700; color: #374151; margin-bottom: 0.5rem; display: block; }
.pt-modal-input {
  width: 100%; background: #F8F9FB; border: 1.5px solid #E0E4ED; border-radius: 8px;
  padding: 0.75rem 1rem; font-family: 'DM Mono', monospace; font-size: 0.9375rem;
  color: #1A1A2E; outline: none; transition: border-color 0.15s; letter-spacing: 0.08em;
}
.pt-modal-input::placeholder { font-family: 'Source Sans 3', sans-serif; letter-spacing: normal; color: #B0B7C3; font-size: 0.875rem; }
.pt-modal-input:focus { border-color: #1351B4; box-shadow: 0 0 0 3px rgba(19,81,180,0.1); }
.pt-modal-hint { font-size: 0.75rem; color: #9CA3AF; margin-top: 0.5rem; line-height: 1.4; }
.pt-modal-footer { padding: 1rem 1.5rem 1.5rem; display: flex; gap: 0.75rem; }
.pt-modal-confirm {
  flex: 1; padding: 0.75rem; background: #1351B4; border: none; border-radius: 9px;
  font-family: 'Source Sans 3', sans-serif; font-size: 0.9375rem; font-weight: 700;
  color: #fff; cursor: pointer; transition: background 0.15s, box-shadow 0.15s;
}
.pt-modal-confirm:hover { background: #0A3A8E; box-shadow: 0 4px 16px rgba(19,81,180,0.25); }
.pt-modal-confirm:disabled { background: #A0B4D8; cursor: not-allowed; }
.pt-modal-cancel {
  padding: 0.75rem 1.25rem; background: transparent; border: 1.5px solid #E0E4ED;
  border-radius: 9px; font-family: 'Source Sans 3', sans-serif; font-size: 0.9375rem;
  font-weight: 600; color: #6B7280; cursor: pointer; transition: all 0.15s;
}
.pt-modal-cancel:hover { border-color: #9CA3AF; color: #374151; }

@keyframes ptDot { 0%,80%,100%{opacity:0;transform:scale(0.6)} 40%{opacity:1;transform:scale(1)} }
.pt-dots { display: flex; align-items: center; justify-content: center; gap: 4px; }
.pt-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: ptDot 1.2s infinite ease-in-out; }
.pt-dot:nth-child(2) { animation-delay: 0.2s; }
.pt-dot:nth-child(3) { animation-delay: 0.4s; }

/* Footer */
.pt-footer {
  background: #071D41; color: rgba(255,255,255,0.5); padding: 2rem;
  text-align: center; font-size: 0.8125rem; border-top: 3px solid #1351B4;
}
.pt-footer strong { color: rgba(255,255,255,0.8); }

@media (max-width: 768px) {
  .pt-header-inner { padding: 0 1rem; }
  .pt-main { padding: 1.5rem 1rem 3rem; }
  .pt-hero { padding: 2rem 1.5rem; }
  .pt-hero-title { font-size: 1.5rem; }
  .pt-hero-stats { gap: 1.5rem; flex-wrap: wrap; }
  .pt-audit-stats { grid-template-columns: 1fr; }
  .pt-access-btn { padding: 0.25rem 0.5rem; font-size: 0.6875rem; }
  .pt-table-wrap { overflow-x: auto; }
  .pt-table { min-width: 800px; }
}
`;

/* ─────────────────────────────────────────────
   SVG ICONS
───────────────────────────────────────────── */
const I = ({ d, size = 16, style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    {d}
  </svg>
);

const UserIcon       = (p) => <I {...p} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const ClipboardIcon  = (p) => <I {...p} d={<><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></>} />;
const TrendingIcon   = (p) => <I {...p} d={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>} />;
const GavelIcon      = (p) => <I {...p} d={<><path d="m14.5 12.5-8 8a2.119 2.119 0 0 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/></>} />;
const BanIcon        = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>} />;
const UsersIcon      = (p) => <I {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const LockIcon       = (p) => <I {...p} d={<><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />;
const CheckIcon      = (p) => <I {...p} d={<polyline points="20 6 9 17 4 12"/>} strokeWidth="3" />;
const ArrowLeftIcon  = (p) => <I {...p} d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />;
const ShieldIcon     = (p) => <I {...p} d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />;
const InfoIcon       = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>} />;
const KeyIcon        = (p) => <I {...p} d={<><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/></>} />;
const BuildingIcon   = (p) => <I {...p} d={<><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 9l9-6 9 6"/><line x1="9" y1="21" x2="9" y2="12"/><line x1="15" y1="21" x2="15" y2="12"/></>} />;
const ClockIcon      = (p) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const SearchIcon     = (p) => <I {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />;
const CrownIcon      = (p) => <I {...p} d={<><path d="M2 19h20"/><path d="M2 19l3-9 5 5 2-9 2 9 5-5 3 9"/></>} />;
const FileTextIcon   = (p) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>} />;
const BankIcon       = (p) => <I {...p} d={<><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></>} />;

const CONSULTA_ICONS = {
  servidores: UserIcon,
  contratos:  ClipboardIcon,
  despesas:   TrendingIcon,
  licitacoes: GavelIcon,
  sancoes:    BanIcon,
  beneficios: UsersIcon,
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const PALETTES = [
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#E0F2FE", color: "#0369A1" },
];
const palette = (name) => PALETTES[name.charCodeAt(0) % PALETTES.length];

/* ─────────────────────────────────────────────
   MASKED FIELD
───────────────────────────────────────────── */
function MaskedField({ fieldKey, maskedValue, token, datatype, accessLevel, revealedValues, onRevealRequest }) {
  const realValue = revealedValues[fieldKey];
  const isAdmin   = accessLevel === "admin";
  const isAuditor = accessLevel === "auditor";

  if (isAdmin) {
    if (realValue) return <span className="pt-revealed"><CheckIcon size={12} />{realValue}</span>;
    return (
      <span className="pt-masked"><LockIcon size={11} />{maskedValue || "••••••••"}</span>
    );
  }

  if (realValue) {
    return <span className="pt-revealed"><CheckIcon size={12} />{realValue}</span>;
  }

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
      <span className="pt-masked">
        <LockIcon size={11} />
        {maskedValue || "••••••••"}
      </span>
      {isAuditor && (
        <button className="pt-reveal-btn" onClick={() => onRevealRequest(fieldKey, datatype, token)}>
          <KeyIcon size={11} /> Revelar
        </button>
      )}
      {!isAuditor && !isAdmin && (
        <RequestButton />
      )}
    </span>
  );
}

function RequestButton() {
  const [requested, setRequested] = useState(false);
  if (requested) {
    return (
      <span className="pt-requested-badge">
        <ClockIcon size={11} /> Solicitação enviada
      </span>
    );
  }
  return (
    <button className="pt-request-btn" onClick={() => setRequested(true)}>
      Solicitar Acesso
    </button>
  );
}

/* ─────────────────────────────────────────────
   TOKEN MODAL
───────────────────────────────────────────── */
const FIELD_LABELS = {
  cpf: "CPF", beneficios: "Benefícios Mensais", endereco: "Endereço Residencial",
  nascimento: "Data de Nascimento", cnpj: "CNPJ do Fornecedor",
  responsavel: "Responsável pelo Contrato", banco: "Dados Bancários",
};

function TokenModal({ pendingField, onConfirm, onCancel }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  const fieldKey = pendingField?.fieldKey ?? "";
  const fieldLabel = Object.entries(FIELD_LABELS).find(([k]) => fieldKey.includes(k))?.[1] ?? fieldKey;

  const handleConfirm = () => {
    if (!token.trim()) return;
    setLoading(true);
    onConfirm(token);
  };

  return (
    <div className="pt-modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="pt-modal">
        <div className="pt-modal-header">
          <div>
            <div className="pt-modal-tag">
              <LockIcon size={9} /> Autenticação CGU
            </div>
            <div className="pt-modal-title">Verificação de Credencial</div>
            <div className="pt-modal-subtitle">Acesso a dado protegido pela LGPD</div>
          </div>
          <button className="pt-modal-close" onClick={onCancel}>✕</button>
        </div>
        <div className="pt-modal-body">
          <div className="pt-modal-info">
            <InfoIcon size={15} style={{ flexShrink: 0 }} />
            Este acesso será registrado no log de auditoria com IP e justificativa.
          </div>
          <div className="pt-modal-field-info">
            <div className="pt-modal-field-label">Campo solicitado</div>
            <div className="pt-modal-field-name">{fieldLabel}</div>
          </div>
          <label className="pt-modal-input-label">Token de Credencial</label>
          <input
            ref={inputRef}
            className="pt-modal-input"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Insira seu token de acesso"
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
          />
          <div className="pt-modal-hint">
            Token emitido pelo sistema microtoken da CGU. Use qualquer valor para simular.
          </div>
        </div>
        <div className="pt-modal-footer">
          <button className="pt-modal-cancel" onClick={onCancel}>Cancelar</button>
          <button className="pt-modal-confirm" onClick={handleConfirm} disabled={!token.trim() || loading}>
            {loading ? <span className="pt-dots"><span className="pt-dot"/><span className="pt-dot"/><span className="pt-dot"/></span> : "Confirmar Acesso"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME TAB
───────────────────────────────────────────── */
function HomeTab({ onNavigate }) {
  return (
    <div>
      <div className="pt-hero">
        <div className="pt-hero-tag">Atualizado em 20/04/2026</div>
        <h1 className="pt-hero-title">Acesso às informações públicas do Governo Federal</h1>
        <p className="pt-hero-desc">
          Consulte dados de servidores, contratos, despesas e benefícios. Campos sensíveis são protegidos
          pela LGPD e revelados apenas mediante credencial auditável via microtoken.
        </p>
        <div className="pt-hero-search">
          <select className="pt-hero-search-select">
            <option>Servidores</option>
            <option>Contratos</option>
            <option>Despesas</option>
            <option>Licitações</option>
          </select>
          <input type="text" placeholder="Buscar por nome, CPF, órgão, nº contrato..." className="pt-hero-search-input" />
          <button className="pt-hero-search-btn">Consultar</button>
        </div>
        <div className="pt-hero-stats">
          {[["2,1M","Servidores ativos"],["890K","Contratos vigentes"],["R$ 1,4T","Orçamento 2026"],["48K","Acessos auditados hoje"]].map(([n,l]) => (
            <div key={l}>
              <div className="pt-hero-stat-num">{n}</div>
              <div className="pt-hero-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="pt-consultas-title">Consultas Disponíveis</h2>
      <div className="pt-consultas-grid">
        {CONSULTAS.map((c) => {
          const Icon = CONSULTA_ICONS[c.id];
          return (
            <div key={c.id} className="pt-consulta-card" onClick={() => (c.id === "servidores" || c.id === "contratos") && onNavigate(c.id)}>
              <div className="pt-consulta-icon"><Icon size={20} /></div>
              <div className="pt-consulta-titulo">{c.titulo}</div>
              <div className="pt-consulta-desc">{c.desc}</div>
              <div className="pt-consulta-qtd">{c.qtd}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SERVIDORES TAB
───────────────────────────────────────────── */
function ServidoresTab({ servidores, accessLevel, revealedValues, onRevealRequest, onViewDetail }) {
  const [search, setSearch] = useState("");
  const [orgaoFilter, setOrgaoFilter] = useState("all");
  const orgaos = [...new Set(servidores.map((s) => s.sigla_orgao))];
  const filtered = servidores.filter((s) => {
    const matchSearch = !search || s.nome.toLowerCase().includes(search.toLowerCase()) || s.cargo.toLowerCase().includes(search.toLowerCase());
    const matchOrgao  = orgaoFilter === "all" || s.sigla_orgao === orgaoFilter;
    return matchSearch && matchOrgao;
  });

  return (
    <div>
      <div className="pt-page-header">
        <div>
          <div className="pt-page-breadcrumb">
            <span>Início</span><span>›</span>
            <a href="#">Servidores e Pensionistas</a>
          </div>
          <h1 className="pt-page-title">Servidores Públicos Federais</h1>
        </div>
      </div>

      <div className="pt-filters">
        <div className="pt-filter-group">
          <div className="pt-filter-label">Nome ou Cargo</div>
          <input className="pt-filter-input" placeholder="Ex: Maria Silva, Analista..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="pt-filter-group" style={{ maxWidth: 200 }}>
          <div className="pt-filter-label">Órgão</div>
          <select className="pt-filter-select" value={orgaoFilter} onChange={(e) => setOrgaoFilter(e.target.value)}>
            <option value="all">Todos</option>
            {orgaos.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="pt-filter-group" style={{ maxWidth: 220 }}>
          <div className="pt-filter-label">Faixa Salarial</div>
          <select className="pt-filter-select"><option>Qualquer faixa</option><option>Até R$ 5.000</option><option>R$ 5.000 – R$ 10.000</option><option>Acima de R$ 10.000</option></select>
        </div>
        <button className="pt-filter-btn">Filtrar</button>
      </div>

      <div className="pt-table-wrap">
        <div className="pt-table-toolbar">
          <div className="pt-table-count">Exibindo <strong>{filtered.length}</strong> de {servidores.length} registros</div>
        </div>
        <table className="pt-table">
          <thead>
            <tr><th>Servidor</th><th>Órgão</th><th>Cargo</th><th>CPF</th><th>Salário Bruto</th><th>Benefícios</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const p = palette(s.nome);
              return (
                <tr key={s.id}>
                  <td>
                    <div className="pt-name-cell">
                      <div className="pt-table-avatar" style={{ background: p.bg, color: p.color }}>{s.nome.charAt(0)}</div>
                      <div>
                        <div className="pt-name-full">{s.nome}</div>
                        <div className="pt-name-siape">SIAPE {s.siape}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: "#1351B4", fontSize: "0.8125rem" }}>{s.sigla_orgao}</td>
                  <td style={{ maxWidth: 200, fontSize: "0.8125rem" }}>{s.cargo}</td>
                  <td><MaskedField fieldKey={`${s.id}_cpf`} maskedValue={s.servidor_cpf_masked} token={s.servidor_cpf} datatype="cpf" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></td>
                  <td className="pt-salary-cell">{s.salario}</td>
                  <td><MaskedField fieldKey={`${s.id}_beneficios`} maskedValue={s.servidor_beneficios_masked} token={s.servidor_beneficios} datatype="beneficio" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></td>
                  <td><button className="pt-detail-btn" onClick={() => onViewDetail("servidor", s)}>Ver Perfil</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTRATOS TAB
───────────────────────────────────────────── */
function ContratosTab({ contratos, accessLevel, revealedValues, onRevealRequest, onViewDetail }) {
  const [search, setSearch]         = useState("");
  const [orgaoFilter, setOrgaoFilter] = useState("all");
  const [modalFilter, setModalFilter] = useState("all");

  const orgaos    = [...new Set(contratos.map((c) => c.sigla_orgao))];
  const modalidades = [...new Set(contratos.map((c) => c.modalidade))];

  const filtered = contratos.filter((c) => {
    const matchSearch = !search ||
      c.numero.toLowerCase().includes(search.toLowerCase()) ||
      c.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      c.objeto.toLowerCase().includes(search.toLowerCase());
    const matchOrgao  = orgaoFilter === "all" || c.sigla_orgao === orgaoFilter;
    const matchModal  = modalFilter === "all" || c.modalidade === modalFilter;
    return matchSearch && matchOrgao && matchModal;
  });

  return (
    <div>
      <div className="pt-page-header">
        <div>
          <div className="pt-page-breadcrumb">
            <span>Início</span><span>›</span>
            <a href="#">Contratos Públicos</a>
          </div>
          <h1 className="pt-page-title">Contratos da Administração Federal</h1>
        </div>
      </div>

      <div className="pt-filters">
        <div className="pt-filter-group">
          <div className="pt-filter-label">Nº Contrato, Fornecedor ou Objeto</div>
          <input className="pt-filter-input" placeholder="Ex: CT-2024, Tecnodata, limpeza..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="pt-filter-group" style={{ maxWidth: 160 }}>
          <div className="pt-filter-label">Órgão</div>
          <select className="pt-filter-select" value={orgaoFilter} onChange={(e) => setOrgaoFilter(e.target.value)}>
            <option value="all">Todos</option>
            {orgaos.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="pt-filter-group" style={{ maxWidth: 220 }}>
          <div className="pt-filter-label">Modalidade</div>
          <select className="pt-filter-select" value={modalFilter} onChange={(e) => setModalFilter(e.target.value)}>
            <option value="all">Todas</option>
            {modalidades.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button className="pt-filter-btn">Filtrar</button>
      </div>

      <div className="pt-table-wrap">
        <div className="pt-table-toolbar">
          <div className="pt-table-count">Exibindo <strong>{filtered.length}</strong> de {contratos.length} contratos</div>
        </div>
        <table className="pt-table">
          <thead>
            <tr><th>Nº Contrato</th><th>Órgão</th><th>Fornecedor</th><th>CNPJ</th><th>Objeto</th><th>Valor Total</th><th>Situação</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const p = palette(c.fornecedor);
              return (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8125rem", fontWeight: 600, color: "#071D41" }}>{c.numero}</span>
                    <div style={{ fontSize: "0.6875rem", color: "#9CA3AF", marginTop: 2 }}>{c.modalidade}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: "#1351B4", fontSize: "0.8125rem" }}>{c.sigla_orgao}</td>
                  <td>
                    <div className="pt-name-cell">
                      <div className="pt-table-avatar" style={{ background: p.bg, color: p.color }}>{c.fornecedor.charAt(0)}</div>
                      <div>
                        <div className="pt-name-full" style={{ fontSize: "0.8125rem" }}>{c.fornecedor}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <MaskedField fieldKey={`c${c.id}_cnpj`} maskedValue={c.contrato_cnpj_masked} token={c.contrato_cnpj} datatype="cnpj" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} />
                  </td>
                  <td style={{ maxWidth: 260, fontSize: "0.8125rem", color: "#4B5563", lineHeight: 1.4 }}>
                    {c.objeto.length > 80 ? c.objeto.slice(0, 80) + "…" : c.objeto}
                  </td>
                  <td className="pt-contract-val">{c.valor}</td>
                  <td>
                    <span className={`pt-status-badge ${c.situacao === "Vigente" ? "green" : "blue"}`}>{c.situacao}</span>
                  </td>
                  <td><button className="pt-detail-btn" onClick={() => onViewDetail("contrato", c)}>Ver Contrato</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DETAIL TAB — SERVIDOR
───────────────────────────────────────────── */
function ServidorDetail({ servidor, accessLevel, revealedValues, onRevealRequest, onBack }) {
  const p = palette(servidor.nome);
  return (
    <div>
      <button className="pt-back-btn" onClick={onBack}><ArrowLeftIcon size={14} /> Voltar à Listagem</button>
      <div className="pt-page-header">
        <div>
          <div className="pt-page-breadcrumb"><span>Início</span><span>›</span><a href="#">Servidores</a><span>›</span><span>{servidor.nome}</span></div>
          <h1 className="pt-page-title">Perfil do Servidor</h1>
        </div>
      </div>
      <div className="pt-detail-grid">
        <div className="pt-profile-card">
          <div className="pt-profile-banner" />
          <div className="pt-profile-avatar-wrap">
            <div className="pt-profile-avatar" style={{ background: p.bg, color: p.color }}>{servidor.nome.charAt(0)}</div>
          </div>
          <div className="pt-profile-body">
            <div className="pt-profile-name">{servidor.nome}</div>
            <div className="pt-profile-cargo">{servidor.cargo}</div>
            <div className="pt-profile-orgao">{servidor.orgao}</div>
            <span className="pt-status-badge green">{servidor.situacao}</span>
            <div className="pt-profile-divider" />
            <div className="pt-profile-meta">
              {[["SIAPE", servidor.siape],["Vínculo", servidor.vinculo],["Admissão", servidor.admissao]].map(([l,v]) => (
                <div key={l} className="pt-profile-meta-row">
                  <span className="pt-profile-meta-label">{l}</span>
                  <span className="pt-profile-meta-val" style={l === "SIAPE" ? { fontFamily: "'DM Mono', monospace", fontSize: "0.8125rem" } : {}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-detail-sections">
          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon blue"><UserIcon size={15} /></div><span className="pt-section-title">Dados Pessoais</span></div>
            <div className="pt-section-body">
              <div className="pt-field"><div className="pt-field-label">Nome Completo</div><div className="pt-field-val">{servidor.nome}</div></div>
              <div className="pt-field"><div className="pt-field-label">CPF</div><MaskedField fieldKey={`${servidor.id}_cpf`} maskedValue={servidor.servidor_cpf_masked} token={servidor.servidor_cpf} datatype="cpf" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></div>
              <div className="pt-field"><div className="pt-field-label">Data de Nascimento</div><MaskedField fieldKey={`${servidor.id}_nascimento`} maskedValue={servidor.servidor_nascimento_masked} token={servidor.servidor_nascimento} datatype="nascimento" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></div>
              <div className="pt-field"><div className="pt-field-label">Endereço</div><MaskedField fieldKey={`${servidor.id}_endereco`} maskedValue={servidor.servidor_endereco_masked} token={servidor.servidor_endereco} datatype="endereco" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></div>
            </div>
          </div>
          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon green"><TrendingIcon size={15} /></div><span className="pt-section-title">Remuneração</span></div>
            <div className="pt-section-body">
              <div className="pt-field"><div className="pt-field-label">Salário Bruto</div><div className="pt-field-val salary">{servidor.salario}</div></div>
              <div className="pt-field"><div className="pt-field-label">Benefícios Mensais</div><MaskedField fieldKey={`${servidor.id}_beneficios`} maskedValue={servidor.servidor_beneficios_masked} token={servidor.servidor_beneficios} datatype="beneficio" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} /></div>
            </div>
          </div>
          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon yellow"><BuildingIcon size={15} /></div><span className="pt-section-title">Vínculos e Cargo</span></div>
            <div className="pt-section-body">
              {[["Órgão", servidor.orgao],["Cargo", servidor.cargo],["Vínculo", servidor.vinculo],["Admissão", servidor.admissao]].map(([l,v]) => (
                <div key={l} className="pt-field"><div className="pt-field-label">{l}</div><div className="pt-field-val">{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DETAIL TAB — CONTRATO
───────────────────────────────────────────── */
function ContratoDetail({ contrato, accessLevel, revealedValues, onRevealRequest, onBack }) {
  const p = palette(contrato.fornecedor);
  return (
    <div>
      <button className="pt-back-btn" onClick={onBack}><ArrowLeftIcon size={14} /> Voltar à Listagem</button>
      <div className="pt-page-header">
        <div>
          <div className="pt-page-breadcrumb"><span>Início</span><span>›</span><a href="#">Contratos</a><span>›</span><span>{contrato.numero}</span></div>
          <h1 className="pt-page-title">Detalhamento do Contrato</h1>
        </div>
      </div>
      <div className="pt-detail-grid">
        {/* Left card */}
        <div className="pt-profile-card">
          <div className="pt-profile-banner" />
          <div className="pt-profile-avatar-wrap">
            <div className="pt-profile-avatar" style={{ background: p.bg, color: p.color }}>{contrato.fornecedor.charAt(0)}</div>
          </div>
          <div className="pt-profile-body">
            <div className="pt-profile-name" style={{ fontSize: "0.9375rem" }}>{contrato.fornecedor}</div>
            <div className="pt-profile-cargo">Fornecedor / Contratada</div>
            <div className="pt-profile-orgao">{contrato.orgao}</div>
            <span className={`pt-status-badge ${contrato.situacao === "Vigente" ? "green" : "blue"}`}>{contrato.situacao}</span>
            <div className="pt-profile-divider" />
            <div className="pt-profile-meta">
              {[["Nº Contrato", contrato.numero],["Modalidade", contrato.modalidade],["Assinatura", contrato.data_assinatura]].map(([l,v]) => (
                <div key={l} className="pt-profile-meta-row">
                  <span className="pt-profile-meta-label">{l}</span>
                  <span className="pt-profile-meta-val" style={l === "Nº Contrato" ? { fontFamily: "'DM Mono', monospace", fontSize: "0.75rem" } : {}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="pt-detail-sections">
          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon blue"><FileTextIcon size={15} /></div><span className="pt-section-title">Objeto do Contrato</span></div>
            <div className="pt-section-body" style={{ gridTemplateColumns: "1fr" }}>
              <div className="pt-field"><div className="pt-field-label">Descrição</div><div className="pt-field-val" style={{ lineHeight: 1.6 }}>{contrato.objeto}</div></div>
              <div className="pt-field"><div className="pt-field-label">Vigência</div><div className="pt-field-val mono">{contrato.vigencia}</div></div>
            </div>
          </div>

          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon green"><TrendingIcon size={15} /></div><span className="pt-section-title">Valores</span></div>
            <div className="pt-section-body">
              <div className="pt-field"><div className="pt-field-label">Valor Total do Contrato</div><div className="pt-field-val contract-val">{contrato.valor}</div></div>
            </div>
          </div>

          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon yellow"><ClipboardIcon size={15} /></div><span className="pt-section-title">Dados Sensíveis do Fornecedor</span></div>
            <div className="pt-section-body">
              <div className="pt-field">
                <div className="pt-field-label">CNPJ</div>
                <MaskedField fieldKey={`c${contrato.id}_cnpj`} maskedValue={contrato.contrato_cnpj_masked} token={contrato.contrato_cnpj} datatype="cnpj" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} />
              </div>
              <div className="pt-field">
                <div className="pt-field-label">Responsável pelo Contrato</div>
                <MaskedField fieldKey={`c${contrato.id}_responsavel`} maskedValue={contrato.contrato_responsavel_masked} token={contrato.contrato_responsavel} datatype="responsavel" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} />
              </div>
              <div className="pt-field" style={{ gridColumn: "1 / -1" }}>
                <div className="pt-field-label">Dados Bancários</div>
                <MaskedField fieldKey={`c${contrato.id}_banco`} maskedValue={contrato.contrato_banco_masked} token={contrato.contrato_banco} datatype="bank" accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={onRevealRequest} />
              </div>
            </div>
          </div>

          <div className="pt-section">
            <div className="pt-section-header"><div className="pt-section-icon blue"><BuildingIcon size={15} /></div><span className="pt-section-title">Órgão Contratante</span></div>
            <div className="pt-section-body">
              {[["Órgão", contrato.orgao],["Sigla", contrato.sigla_orgao],["Modalidade", contrato.modalidade]].map(([l,v]) => (
                <div key={l} className="pt-field"><div className="pt-field-label">{l}</div><div className="pt-field-val">{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUDIT TAB
───────────────────────────────────────────── */
function AuditTab({ auditLog }) {
  const [campoFilter, setCampoFilter]     = useState("all");
  const [contextoFilter, setContextoFilter] = useState("all");
  const campos    = [...new Set(auditLog.map((e) => e.campo))];
  const contextos = [...new Set(auditLog.map((e) => e.contexto))];
  const filtered  = auditLog.filter((e) =>
    (campoFilter === "all" || e.campo === campoFilter) &&
    (contextoFilter === "all" || e.contexto === contextoFilter)
  );

  const badgeColor = { CPF: "blue", Endereço: "yellow", Benefícios: "green", CNPJ: "blue", "Dados Bancários": "yellow", Responsável: "yellow" };

  return (
    <div>
      <div className="pt-page-header">
        <div>
          <div className="pt-page-breadcrumb"><span>Início</span><span>›</span><a href="#">Administração</a><span>›</span><span>Log de Auditoria</span></div>
          <h1 className="pt-page-title">Registro de Acessos</h1>
        </div>
        <div className="pt-lgpd-badge"><ShieldIcon size={13} /> Rastreabilidade — LGPD Art. 37</div>
      </div>

      <div className="pt-audit-stats">
        {[[String(auditLog.length),"Acessos registrados"],["5","Usuários únicos hoje"],["4","Campos distintos revelados"]].map(([n,l]) => (
          <div key={l} className="pt-audit-stat">
            <div className="pt-audit-stat-num">{n}</div>
            <div className="pt-audit-stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="pt-filters">
        <div className="pt-filter-group" style={{ maxWidth: 200 }}>
          <div className="pt-filter-label">Campo</div>
          <select className="pt-filter-select" value={campoFilter} onChange={(e) => setCampoFilter(e.target.value)}>
            <option value="all">Todos</option>
            {campos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="pt-filter-group" style={{ maxWidth: 200 }}>
          <div className="pt-filter-label">Contexto</div>
          <select className="pt-filter-select" value={contextoFilter} onChange={(e) => setContextoFilter(e.target.value)}>
            <option value="all">Todos</option>
            {contextos.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="pt-filter-btn">Filtrar</button>
      </div>

      <div className="pt-table-wrap">
        <div className="pt-table-toolbar">
          <div className="pt-table-count"><strong>{filtered.length}</strong> eventos de acesso</div>
        </div>
        <table className="pt-table">
          <thead>
            <tr><th>#</th><th>Usuário / Órgão</th><th>Contexto</th><th>Registro Consultado</th><th>Campo</th><th>Data / Hora</th><th>IP</th><th>Justificativa</th></tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#9CA3AF" }}>#{String(e.id).padStart(4, "0")}</td>
                <td style={{ fontSize: "0.8125rem", maxWidth: 200 }}>{e.usuario}</td>
                <td><span className={`pt-status-badge ${e.contexto === "Contratos" ? "blue" : "green"}`}>{e.contexto}</span></td>
                <td style={{ fontWeight: 600, color: "#071D41", fontSize: "0.875rem", maxWidth: 180 }}>{e.servidor}</td>
                <td><span className={`pt-status-badge ${badgeColor[e.campo] ?? "blue"}`}>{e.campo}</span></td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#6B7280", whiteSpace: "nowrap" }}>{e.data}</td>
                <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#9CA3AF" }}>{e.ip}</td>
                <td style={{ fontSize: "0.75rem", color: "#6B7280", maxWidth: 240 }}>{e.justificativa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function PortalTransparencia() {
  const [currentUser,   setCurrentUser]   = useState(null);
  const [activeTab,     setActiveTab]     = useState("home");
  const [accessLevel,   setAccessLevel]   = useState("citizen");
  const [detailContext, setDetailContext] = useState(null);
  const [revealedValues, setRevealedValues] = useState({});
  const [showModal,     setShowModal]     = useState(false);
  const [pendingField,  setPendingField]  = useState(null);
  const [auditLog,      setAuditLog]      = useState(INITIAL_AUDIT_LOG);
  const [servidores,    setServidores]    = useState([]);
  const [contratos,     setContratos]     = useState([]);
  const [dataLoading,   setDataLoading]   = useState(true);

  const handleLogout = () => {
    setCurrentUser(null);
    setAccessLevel("citizen");
    setRevealedValues({});
    setActiveTab("home");
    setDetailContext(null);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/servidores/").then((r) => r.json()),
      fetch("/api/portal/contratos/").then((r) => r.json()),
    ])
      .then(([serv, cont]) => {
        setServidores(serv);
        setContratos(cont);
      })
      .catch(console.error)
      .finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    if (accessLevel !== "admin") return;
    if (servidores.length === 0 && contratos.length === 0) return;

    const allFields = [];
    servidores.forEach((s) => {
      if (s.is_tokenized) {
        allFields.push({ key: `${s.id}_cpf`,        datatype: "cpf",        token: s.servidor_cpf });
        allFields.push({ key: `${s.id}_beneficios`,  datatype: "beneficio",  token: s.servidor_beneficios });
        allFields.push({ key: `${s.id}_endereco`,    datatype: "endereco",   token: s.servidor_endereco });
        allFields.push({ key: `${s.id}_nascimento`,  datatype: "nascimento", token: s.servidor_nascimento });
      }
    });
    contratos.forEach((c) => {
      if (c.is_tokenized) {
        allFields.push({ key: `c${c.id}_cnpj`,        datatype: "cnpj",        token: c.contrato_cnpj });
        allFields.push({ key: `c${c.id}_responsavel`, datatype: "responsavel", token: c.contrato_responsavel });
        allFields.push({ key: `c${c.id}_banco`,       datatype: "bank",        token: c.contrato_banco });
      }
    });
    if (allFields.length === 0) return;

    fetch("/api/portal/detokenize/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: allFields, clear: true }),
    })
      .then((r) => r.json())
      .then((data) => setRevealedValues((prev) => ({ ...prev, ...data })))
      .catch(console.error);
  }, [accessLevel, servidores, contratos]);

  const handleRevealRequest = (fieldKey, datatype, token) => {
    setPendingField({ fieldKey, datatype, token });
    setShowModal(true);
  };

  const handleModalConfirm = async (credentialToken) => {
    const { fieldKey, datatype, token } = pendingField;
    try {
      const resp = await fetch("/api/portal/detokenize/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: [{ key: fieldKey, datatype, token }], clear: true }),
      });
      const data = await resp.json();
      if (data[fieldKey]) {
        setRevealedValues((prev) => ({ ...prev, [fieldKey]: data[fieldKey] }));
      }

      const isContrato = fieldKey.startsWith("c");
      const id = parseInt(fieldKey.replace(/^c/, "").split("_")[0]);
      const record = isContrato
        ? contratos.find((c) => c.id === id)
        : servidores.find((s) => s.id === id);
      const fieldPart = fieldKey.split("_").slice(1).join("_");
      const fieldLabel = Object.entries(FIELD_LABELS).find(([k]) => fieldPart.includes(k))?.[1] ?? fieldPart;

      setAuditLog((prev) => [{
        id: prev.length + 1,
        usuario: "Auditor — sessão atual",
        campo: fieldLabel,
        contexto: isContrato ? "Contratos" : "Servidores",
        servidor: record ? (isContrato ? `${record.numero} · ${record.fornecedor}` : record.nome) : "—",
        data: new Date().toLocaleString("pt-BR").replace(",", ""),
        ip: "127.0.0.***",
        justificativa: `Credencial microtoken: ${credentialToken.slice(0, 6)}... — via portal`,
      }, ...prev]);
    } catch (err) {
      console.error("Reveal error:", err);
    } finally {
      setShowModal(false);
      setPendingField(null);
    }
  };

  const handleViewDetail = (type, data) => {
    setDetailContext({ type, data });
    setActiveTab("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TABS = [
    { id: "home",      label: "Início" },
    { id: "servidores", label: "Servidores" },
    { id: "contratos",  label: "Contratos Públicos" },
    { id: "detail",    label: detailContext?.type === "contrato" ? "Contrato" : "Perfil do Servidor", hidden: !detailContext },
    { id: "audit",     label: "Log de Auditoria" },
  ];

  if (!currentUser) {
    return <LoginPortal onLogin={(user) => { setCurrentUser(user); setAccessLevel(user.role); }} />;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pt-root">
        <div className="pt-govbar" />

        <header className="pt-header">
          <div className="pt-header-inner">
            <div className="pt-logo-block">
              <div className="pt-govbr-badge">
                <div className="pt-govbr-star">★</div>
                <span className="pt-govbr-label">gov</span>
              </div>
              <div className="pt-header-divider" />
              <div className="pt-portal-label">
                <div className="pt-portal-title">Portal da Transparência</div>
                <div className="pt-portal-sub">Controladoria-Geral da Neotel</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {accessLevel === "admin" && (
                <a
                  href="/gerenciar"
                  style={{
                    display: "flex", alignItems: "center", gap: "0.375rem",
                    padding: "0.3125rem 0.875rem", background: "rgba(201,123,0,0.18)",
                    border: "1px solid rgba(201,123,0,0.4)", borderRadius: 8,
                    fontSize: "0.75rem", fontWeight: 700, color: "#FFCD07",
                    textDecoration: "none", fontFamily: "'Source Sans 3', sans-serif",
                    transition: "background 0.15s",
                  }}
                >
                  ⚙ Gerenciar
                </a>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "0.3125rem 0.5rem 0.3125rem 0.75rem",
              }}>
                <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontFamily: "'Source Sans 3', sans-serif" }}>
                  Olá, {currentUser.label}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sair"
                  style={{
                    marginLeft: "0.25rem", padding: "0.25rem 0.5rem",
                    background: "rgba(229,34,7,0.15)", border: "1px solid rgba(229,34,7,0.3)",
                    borderRadius: 6, cursor: "pointer", color: "#FF8F80",
                    fontSize: "0.7rem", fontWeight: 700, fontFamily: "'Source Sans 3', sans-serif",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(229,34,7,0.28)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(229,34,7,0.15)"}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <nav className="pt-nav">
          <div className="pt-nav-inner">
            {TABS.filter((t) => !t.hidden).map((tab) => (
              <button key={tab.id} className={`pt-nav-item ${activeTab === tab.id ? "active" : ""}`} onClick={() => handleNavigate(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="pt-main">
          {dataLoading
            ? <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}><div className="hr-det-spinner" style={{ width: 32, height: 32, border: "3px solid #E0E4ED", borderTopColor: "#1351B4", borderRadius: "50%", animation: "hrDetSpin 0.7s linear infinite" }} /></div>
            : <>
                {activeTab === "home" && <HomeTab onNavigate={handleNavigate} />}
                {activeTab === "servidores" && <ServidoresTab servidores={servidores} accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={handleRevealRequest} onViewDetail={handleViewDetail} />}
                {activeTab === "contratos"  && <ContratosTab  contratos={contratos}   accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={handleRevealRequest} onViewDetail={handleViewDetail} />}
                {activeTab === "detail" && detailContext?.type === "servidor" && <ServidorDetail servidor={detailContext.data} accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={handleRevealRequest} onBack={() => setActiveTab("servidores")} />}
                {activeTab === "detail" && detailContext?.type === "contrato" && <ContratoDetail contrato={detailContext.data} accessLevel={accessLevel} revealedValues={revealedValues} onRevealRequest={handleRevealRequest} onBack={() => setActiveTab("contratos")} />}
                {activeTab === "audit" && <AuditTab auditLog={auditLog} />}
              </>
          }
        </main>

        <footer className="pt-footer">
          <strong>Portal da Transparência</strong> · Controladoria-Geral da Neotel ·
          Dados protegidos pela <strong>LGPD — Lei nº 13.709/2018</strong> ·
          Campos sensíveis mascarados por <strong>microtoken</strong>
        </footer>

        {showModal && pendingField && <TokenModal pendingField={pendingField} onConfirm={handleModalConfirm} onCancel={() => { setShowModal(false); setPendingField(null); }} />}
      </div>
    </>
  );
}
