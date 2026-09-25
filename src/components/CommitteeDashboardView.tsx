import React, { useState } from 'react';
import {
  ProponentData,
  ComponentType,
  PROCESS_PARAMETERS,
  GlossaryEntry,
  TDR_REQUIREMENTS,
} from '../data/procurementCaseData';
import {
  EvaluatedFinancialRow,
  ProponentSummaryStatus,
  EconomicSheetResult,
  formatCOP,
} from '../utils/spreadsheetEngine';
import {
  FileText,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Scale,
  ArrowRight,
  Download,
} from 'lucide-react';

interface CommitteeDashboardViewProps {
  proponents: ProponentData[];
  financialRows: EvaluatedFinancialRow[];
  summaries: ProponentSummaryStatus[];
  economicSheet: EconomicSheetResult;
  phase1EconomicComparison: EconomicSheetResult;
  simulatePhase1: boolean;
  setSimulatePhase1: (val: boolean) => void;
  includeExtendedProponentE: boolean;
  setIncludeExtendedProponentE: (val: boolean) => void;
  glossary: GlossaryEntry[];
  onUpdateObservation: (
    proponentId: string,
    requirementId: string,
    observation: string,
    decision?: 'PENDIENTE' | 'ACEPTADO' | 'SUBSANAR' | 'RECHAZADO'
  ) => void;
  onUpdateGlobalCommitteeDecision: (
    proponentId: string,
    decision: ProponentData['committeeGlobalDecision']
  ) => void;
  onApplyGeminiVerification: (proponentId: string, verifications: any[]) => void;
  onExportStandaloneHtml: () => void;
  onNavigateToSheet: () => void;
  onNavigateToReport: () => void;
}

export const CommitteeDashboardView: React.FC<CommitteeDashboardViewProps> = ({
  proponents,
  financialRows,
  summaries,
  economicSheet,
  phase1EconomicComparison,
  simulatePhase1,
  setSimulatePhase1,
  includeExtendedProponentE,
  setIncludeExtendedProponentE,
  glossary,
  onUpdateObservation,
  onUpdateGlobalCommitteeDecision,
  onApplyGeminiVerification,
  onExportStandaloneHtml,
  onNavigateToSheet,
  onNavigateToReport,
}) => {
  const [componentFilter, setComponentFilter] = useState<'TODOS' | ComponentType>('TODOS');
  const [proponentFilter, setProponentFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFolioPreview, setActiveFolioPreview] = useState<{
    proponentName: string;
    numeral: string;
    requirementTitle: string;
    folioNumber: string;
    documentTitle: string;
    issueDate: string;
    excerpt: string;
    whatPresents: string;
  } | null>(null);
  const [verifyingProponentId, setVerifyingProponentId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const totalPresentados = proponents.length;
  const totalHabilitados = summaries.filter((s) => s.overallProposedStatus === 'HABILITADO').length;
  const totalSubsanacion = summaries.filter(
    (s) => s.overallProposedStatus === 'REQUIERE SUBSANACION'
  ).length;
  const totalNoHabilitados = summaries.filter(
    (s) => s.overallProposedStatus === 'NO CUMPLE'
  ).length;

  const handleRunGeminiVerify = async (proponent: ProponentData) => {
    setVerifyingProponentId(proponent.id);
    setVerifyError(null);
    try {
      const docRequirements = TDR_REQUIREMENTS.filter(
        (r) => r.verificationNature === 'Documental (Modelo + Folio)'
      );
      const response = await fetch('/api/gemini/verify-proponent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proponent,
          requirements: docRequirements,
          glossary,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error en la verificación con Gemini');
      }
      if (Array.isArray(data.verifications)) {
        onApplyGeminiVerification(proponent.id, data.verifications);
      }
    } catch (err: any) {
      setVerifyError(err.message || 'No fue posible conectar con el servicio Gemini.');
    } finally {
      setVerifyingProponentId(null);
    }
  };

  // Build unified matrix rows (7 requirements per proponent = 28 rows for 4 proponents)
  const unifiedMatrixRows = proponents.flatMap((p) => {
    const fin = financialRows.find((f) => f.proponentId === p.id)!;
    const findFolioObj = (folioStr: string) =>
      p.folios.find((fl) => fl.folioNumber === folioStr) || {
        folioNumber: folioStr,
        documentTitle:
          folioStr === 'N/A'
            ? 'Documento NO APORTADO en el expediente'
            : `Respaldo documental (${folioStr})`,
        issueDate: '—',
        excerpt:
          folioStr === 'N/A'
            ? 'El proponente omitió aportar este documento en su propuesta. Siguiendo la regla del flujo, el modelo registra NO APORTADO sin deducir ni inventar datos.'
            : 'Verifique el documento físico en el expediente.',
      };

    const techRows = p.documentaryRows
      .filter((r) => r.component === 'Técnico')
      .map((r) => ({
        proponentId: p.id,
        proponentCode: p.code,
        proponentName: p.name,
        requirementId: r.requirementId,
        component: 'Técnico' as ComponentType,
        numeral: r.numeral,
        requirementTitle: r.requirementTitle,
        whatPresents: r.whatPresents,
        folio: r.folio,
        proposedStatus: r.proposedStatus,
        findingNote: r.findingNote,
        committeeObservation: r.committeeObservation,
        committeeRowDecision: r.committeeRowDecision,
        isFormulaRow: false,
        formulaDisplay: '',
        folioObj: findFolioObj(r.folio),
      }));

    const finRows = [
      {
        proponentId: p.id,
        proponentCode: p.code,
        proponentName: p.name,
        requirementId: 'REQ-F1',
        component: 'Financiero' as ComponentType,
        numeral: '5.1',
        requirementTitle: 'Índice de liquidez igual o superior a 2,0',
        whatPresents: `Activo Corriente: ${formatCOP(fin.activoCorriente)} / Pasivo Corriente: ${formatCOP(
          fin.pasivoCorriente
        )} → Índice = ${fin.liquidezValue.toFixed(2).replace('.', ',')} (Corte: ${fin.cutoffDate})`,
        folio: fin.folio,
        proposedStatus: fin.evalLiquidez,
        findingNote: `Calculado en Hoja 2 con fórmula ${fin.liquidezFormula} y validado con ${fin.evalLiquidezFormula}.`,
        committeeObservation: `Cálculo en Hoja de Evaluación (${fin.liquidezFormula})`,
        committeeRowDecision: (fin.evalLiquidez === 'CUMPLE' ? 'ACEPTADO' : 'RECHAZADO') as
          | 'PENDIENTE'
          | 'ACEPTADO'
          | 'SUBSANAR'
          | 'RECHAZADO',
        isFormulaRow: true,
        formulaDisplay: `${fin.liquidezFormula} → ${fin.evalLiquidezFormula}`,
        folioObj: findFolioObj(fin.folio),
      },
      {
        proponentId: p.id,
        proponentCode: p.code,
        proponentName: p.name,
        requirementId: 'REQ-F2',
        component: 'Financiero' as ComponentType,
        numeral: '5.2',
        requirementTitle: 'Índice de endeudamiento igual o inferior al 60 %',
        whatPresents: `Pasivo Total: ${formatCOP(fin.pasivoTotal)} / Activo Total: ${formatCOP(
          fin.activoTotal
        )} → Índice = ${(fin.endeudamientoValue * 100).toFixed(1).replace('.', ',')} % (Corte: ${
          fin.cutoffDate
        })`,
        folio: fin.folio,
        proposedStatus: fin.evalEndeudamiento,
        findingNote: `Calculado en Hoja 2 con fórmula ${fin.endeudamientoFormula} y validado con ${fin.evalEndeudamientoFormula}.`,
        committeeObservation: `Cálculo en Hoja de Evaluación (${fin.endeudamientoFormula})`,
        committeeRowDecision: (fin.evalEndeudamiento === 'CUMPLE' ? 'ACEPTADO' : 'RECHAZADO') as
          | 'PENDIENTE'
          | 'ACEPTADO'
          | 'SUBSANAR'
          | 'RECHAZADO',
        isFormulaRow: true,
        formulaDisplay: `${fin.endeudamientoFormula} → ${fin.evalEndeudamientoFormula}`,
        folioObj: findFolioObj(fin.folio),
      },
    ];

    const guarRows = p.documentaryRows
      .filter((r) => r.component === 'Garantías')
      .map((r) => ({
        proponentId: p.id,
        proponentCode: p.code,
        proponentName: p.name,
        requirementId: r.requirementId,
        component: 'Garantías' as ComponentType,
        numeral: r.numeral,
        requirementTitle: r.requirementTitle,
        whatPresents: r.whatPresents,
        folio: r.folio,
        proposedStatus: r.proposedStatus,
        findingNote: r.findingNote,
        committeeObservation: r.committeeObservation,
        committeeRowDecision: r.committeeRowDecision,
        isFormulaRow: false,
        formulaDisplay: '',
        folioObj: findFolioObj(r.folio),
      }));

    return [...techRows, ...finRows, ...guarRows];
  });

  const filteredMatrixRows = unifiedMatrixRows.filter((row) => {
    if (componentFilter !== 'TODOS' && row.component !== componentFilter) return false;
    if (proponentFilter !== 'TODOS' && row.proponentId !== proponentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.proponentName.toLowerCase().includes(q) ||
        row.requirementTitle.toLowerCase().includes(q) ||
        row.whatPresents.toLowerCase().includes(q) ||
        row.folio.toLowerCase().includes(q) ||
        row.numeral.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Encabezado Institucional del Tablero de Revisión (Prompt 5 / Captura 8) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-1.5">
              <span className="font-mono-tabular font-semibold text-slate-900">
                {PROCESS_PARAMETERS.processCode}
              </span>
              <span aria-hidden="true">·</span>
              <span>ESTADOS PROPUESTOS AL COMITÉ EVALUADOR</span>
              <span aria-hidden="true">·</span>
              <span>Herramienta interna de revisión previa a la firma</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tablero de Revisión — Comité Evaluador
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              {PROCESS_PARAMETERS.object} · Presupuesto Oficial:{' '}
              <span className="font-mono-tabular font-semibold text-slate-900">
                {formatCOP(PROCESS_PARAMETERS.officialBudget)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIncludeExtendedProponentE(!includeExtendedProponentE)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                includeExtendedProponentE
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {includeExtendedProponentE
                ? 'Ocultar Caso Tabla 6 (Proponente E: NO APORTADO)'
                : '+ Probar Caso Tabla 6 (Proponente sin Documento)'}
            </button>

            <button
              onClick={onExportStandaloneHtml}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Tablero (.html autocontenido)
            </button>
          </div>
        </div>

        {/* Regla de Oro de la Fase II */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 border border-amber-200/80 rounded-md px-4 py-3 text-xs text-amber-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <Scale className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Frontera de responsabilidad no delegable:</strong> Los estados en esta matriz son{' '}
              <span className="underline font-semibold">PROPUESTOS al comité evaluador</span> con su
              folio de respaldo. Los índices financieros provienen de fórmulas de la hoja de cálculo.
              La declaración de habilitación y la firma corresponden exclusivamente al comité.
            </span>
          </div>
          <button
            onClick={onNavigateToSheet}
            className="inline-flex items-center gap-1 font-semibold text-amber-900 hover:text-amber-700 whitespace-nowrap shrink-0"
          >
            Auditar Fórmulas en Hoja
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 1. Tira de Indicadores (Prompt 5 Bloque 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 border-t-4 border-t-slate-700 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">Proponentes Presentados</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-tabular text-slate-900">
              {totalPresentados}
            </span>
            <span className="text-xs text-slate-500 font-mono-tabular">
              {totalPresentados * 7} verificaciones
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-600 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Habilitados Directos (Propuestos)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-tabular text-emerald-700">
              {totalHabilitados}
            </span>
            <span className="text-xs text-emerald-700 font-medium">Cumple 7/7 requisitos</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-4 border-t-amber-600 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">
            Con Subsanación / Explicación
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-tabular text-amber-700">
              {totalSubsanacion}
            </span>
            <span className="text-xs text-amber-700 font-medium">Revisión jurídica comité</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-t-4 border-t-red-600 rounded-lg p-5">
          <div className="text-xs font-medium text-slate-500">No Habilitados (Propuestos)</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono-tabular text-red-700">
              {totalNoHabilitados}
            </span>
            <span className="text-xs text-red-700 font-medium">No pasa a eval. económica</span>
          </div>
        </div>
      </div>

      {/* Tabla Resumen Consolidada de Validación (Tabla de la Página 25 del Documento) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              01. Consolidado de Habilitación por Componente y Decisión del Comité
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Resumen ejecutivo de las situaciones detectadas en los expedientes (Sección 8 de
              Validaciones) y control de pase a la evaluación económica.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Verificar expediente con IA:</span>
            {proponents.map((p) => (
              <button
                key={p.id}
                onClick={() => handleRunGeminiVerify(p)}
                disabled={verifyingProponentId !== null}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
                title={`Ejecutar verificación documental asistida con Gemini para ${p.name}`}
              >
                <Sparkles className="w-3 h-3 text-slate-700" />
                {verifyingProponentId === p.id ? 'Verificando...' : p.code}
              </button>
            ))}
          </div>
        </div>

        {verifyError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200 text-xs text-red-800">
            {verifyError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Proponente</th>
                <th className="py-3 px-4 text-right">Oferta Económica</th>
                <th className="py-3 px-4">Técnicos (Doc.)</th>
                <th className="py-3 px-4">Financieros (Hoja)</th>
                <th className="py-3 px-4">Garantías (Doc.)</th>
                <th className="py-3 px-4">Estado Propuesto (IA)</th>
                <th className="py-3 px-4">Decisión del Comité (Humana)</th>
                <th className="py-3 px-4">Pase a Eval. Económica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {summaries.map((s) => {
                const propObj = proponents.find((p) => p.id === s.proponentId)!;
                return (
                  <tr key={s.proponentId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{s.name}</div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        NIT {propObj.nit}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-slate-900">
                      {formatCOP(s.economicOfferValue)}
                      {s.proponentId === 'PROP-C' && (
                        <div className="text-[11px] font-normal text-amber-800">
                          Oferta más baja del caso
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          s.tecnicosStatus === 'CUMPLE'
                            ? 'text-emerald-800 font-medium'
                            : 'text-amber-800 font-semibold'
                        }
                      >
                        {s.tecnicosSummary}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular">
                      <span
                        className={
                          s.financierosStatus === 'CUMPLE'
                            ? 'text-emerald-800 font-medium'
                            : 'text-red-700 font-semibold'
                        }
                      >
                        {s.financierosSummary}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={
                          s.garantiasStatus === 'CUMPLE'
                            ? 'text-emerald-800 font-medium'
                            : 'text-amber-800 font-semibold'
                        }
                      >
                        {s.garantiasSummary}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.overallProposedStatus === 'HABILITADO' && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Habilitado (Propuesto)
                        </span>
                      )}
                      {s.overallProposedStatus === 'REQUIERE SUBSANACION' && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Requiere subsanación
                        </span>
                      )}
                      {s.overallProposedStatus === 'NO CUMPLE' && (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
                          <XCircle className="w-3.5 h-3.5" />
                          No cumple
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={propObj.committeeGlobalDecision}
                        onChange={(e) =>
                          onUpdateGlobalCommitteeDecision(
                            s.proponentId,
                            e.target.value as ProponentData['committeeGlobalDecision']
                          )
                        }
                        aria-label={`Decisión del comité para ${s.name}`}
                        className="border border-slate-300 rounded px-2 py-1 text-xs font-medium bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="HABILITADO POR COMITÉ">HABILITADO POR COMITÉ</option>
                        <option value="EN SUBSANACIÓN">EN SUBSANACIÓN</option>
                        <option value="RECHAZADO / NO HABILITADO">RECHAZADO / NO HABILITADO</option>
                        <option value="PENDIENTE DEL COMITÉ">PENDIENTE DEL COMITÉ</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.passesToEconomicEvaluation ? (
                        <span className="text-emerald-700 font-semibold">
                          Pasa a Hoja 3 (Económica)
                        </span>
                      ) : (
                        <span className="text-red-700 font-semibold">
                          Excluida antes de precio
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Matriz de Requisitos por Proponente con Inspector de Folio en el Sitio (Prompt 5 Bloque 2 + Mejoras Tabla 6) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              02. Matriz Detallada de Requisitos Habilitantes ({filteredMatrixRows.length} de{' '}
              {unifiedMatrixRows.length} verificaciones)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pase el cursor o haga clic en cualquier fila para inspeccionar el extracto exacto del{' '}
              <strong>Folio de respaldo</strong> en el sitio (Mejora Tabla 6) y registrar la
              observación del comité.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro segmentado por Componente (Prompt 5: técnico, financiero y garantías) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['TODOS', 'Técnico', 'Financiero', 'Garantías'] as const).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setComponentFilter(comp)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    componentFilter === comp
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {comp === 'TODOS' ? 'Todos' : comp}
                </button>
              ))}
            </div>

            {/* Filtro por Proponente */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={proponentFilter}
                onChange={(e) => setProponentFilter(e.target.value)}
                aria-label="Filtrar por proponente"
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-800"
              >
                <option value="TODOS">Todos los proponentes</option>
                {proponents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Búsqueda rápida */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar folio, numeral, hallazgo..."
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-800 w-52 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Vista Previa Instantánea del Folio (Mejora Tabla 6: "Que el tablero muestre el folio al pasar el cursor sobre cada fila") */}
        <div className="bg-slate-900 text-slate-100 px-6 py-3.5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {activeFolioPreview ? (
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold text-white">
                  Inspector de Expediente en el Sitio:
                </span>
                <span>{activeFolioPreview.proponentName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-amber-300 font-semibold">
                  {activeFolioPreview.folioNumber}
                </span>
                <span aria-hidden="true">·</span>
                <span>Numeral TDR {activeFolioPreview.numeral}</span>
                <span aria-hidden="true">·</span>
                <span>Fecha doc: {activeFolioPreview.issueDate}</span>
              </div>
              <p className="text-xs font-mono-tabular text-slate-200 whitespace-pre-line leading-relaxed">
                {activeFolioPreview.excerpt}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Eye className="w-4 h-4 text-slate-400" />
              <span>
                <strong>Inspector de Folios activo:</strong> Pase el cursor o haga clic sobre
                cualquier renglón de la matriz inferior para leer el extracto textual del folio sin
                salir del tablero.
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Proponente</th>
                <th className="py-3 px-3">Componente</th>
                <th className="py-3 px-3">Numeral</th>
                <th className="py-3 px-4">Requisito</th>
                <th className="py-3 px-4">Qué presenta el proponente</th>
                <th className="py-3 px-3">Folio</th>
                <th className="py-3 px-4">Estado Propuesto</th>
                <th className="py-3 px-4">Observación del Comité (Tabla 6)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMatrixRows.map((row) => {
                const isNoAportado =
                  row.whatPresents.includes('NO APORTADO') || row.folio === 'N/A';
                return (
                  <tr
                    key={`${row.proponentId}-${row.requirementId}`}
                    onMouseEnter={() =>
                      setActiveFolioPreview({
                        proponentName: row.proponentName,
                        numeral: row.numeral,
                        requirementTitle: row.requirementTitle,
                        folioNumber: row.folioObj.folioNumber,
                        documentTitle: row.folioObj.documentTitle,
                        issueDate: row.folioObj.issueDate,
                        excerpt: row.folioObj.excerpt,
                        whatPresents: row.whatPresents,
                      })
                    }
                    onClick={() =>
                      setActiveFolioPreview({
                        proponentName: row.proponentName,
                        numeral: row.numeral,
                        requirementTitle: row.requirementTitle,
                        folioNumber: row.folioObj.folioNumber,
                        documentTitle: row.folioObj.documentTitle,
                        issueDate: row.folioObj.issueDate,
                        excerpt: row.folioObj.excerpt,
                        whatPresents: row.whatPresents,
                      })
                    }
                    className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {row.proponentName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{row.component}</td>
                    <td className="py-3 px-3 font-mono-tabular font-semibold text-slate-800">
                      {row.numeral}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-xs">
                      {row.requirementTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      <div className={isNoAportado ? 'font-mono-tabular font-bold text-red-700' : ''}>
                        {row.whatPresents}
                      </div>
                      {row.isFormulaRow && (
                        <div className="mt-1 font-mono-tabular text-[11px] text-slate-500">
                          Fórmula Hoja 2: {row.formulaDisplay}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                      <span className="underline decoration-dotted underline-offset-4">
                        {row.folio}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {row.proposedStatus === 'CUMPLE' && (
                        <span className="font-bold text-emerald-700">CUMPLE</span>
                      )}
                      {row.proposedStatus === 'REQUIERE SUBSANACION' && (
                        <span className="font-bold text-amber-700">REQUIERE SUBSANACION</span>
                      )}
                      {row.proposedStatus === 'NO CUMPLE' && (
                        <span className="font-bold text-red-700">NO CUMPLE</span>
                      )}
                    </td>
                    <td className="py-3 px-4 min-w-[220px]" onClick={(e) => e.stopPropagation()}>
                      {row.isFormulaRow ? (
                        <span className="text-slate-500 font-mono-tabular text-[11px]">
                          {row.committeeObservation}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={row.committeeObservation}
                          onChange={(e) =>
                            onUpdateObservation(
                              row.proponentId,
                              row.requirementId,
                              e.target.value
                            )
                          }
                          placeholder="Registrar decisión humana..."
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-800 focus:border-slate-900 focus:outline-none"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Capacidad Financiera y 4/5. Evaluación Económica + Impacto del Orden de Evaluación */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bloque 3: Capacidad Financiera frente al mínimo exigido */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                03. Capacidad Financiera (Frente al Mínimo Exigido)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cifras tomadas sin recalcular de la Hoja 2 · Mínimo Liquidez:{' '}
                <strong className="font-mono-tabular">&ge; 2,0</strong> · Máximo Endeudamiento:{' '}
                <strong className="font-mono-tabular">&le; 60 %</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {financialRows.map((fin) => {
              const liqPctBar = Math.min(100, (fin.liquidezValue / 3.5) * 100);
              const endPctBar = Math.min(100, fin.endeudamientoValue * 100);
              return (
                <div
                  key={fin.proponentId}
                  className="border border-slate-200 rounded-md p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{fin.proponentName}</span>
                      <span className="ml-2 text-[11px] text-slate-500 font-mono-tabular">
                        Corte: {fin.cutoffDate} · {fin.folio}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        fin.estadoFinanciero === 'CUMPLE' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {fin.estadoFinanciero}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Liquidez */}
                    <div>
                      <div className="flex justify-between font-mono-tabular mb-1">
                        <span className="text-slate-600">Liquidez ({fin.liquidezFormula}):</span>
                        <span
                          className={`font-bold ${
                            fin.evalLiquidez === 'CUMPLE' ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {fin.liquidezValue.toFixed(2).replace('.', ',')} (Mín 2,0)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded overflow-hidden relative">
                        <div
                          className={`h-full ${
                            fin.evalLiquidez === 'CUMPLE' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${liqPctBar}%` }}
                        />
                      </div>
                    </div>

                    {/* Endeudamiento */}
                    <div>
                      <div className="flex justify-between font-mono-tabular mb-1">
                        <span className="text-slate-600">
                          Endeudamiento ({fin.endeudamientoFormula}):
                        </span>
                        <span
                          className={`font-bold ${
                            fin.evalEndeudamiento === 'CUMPLE'
                              ? 'text-emerald-700'
                              : 'text-red-700'
                          }`}
                        >
                          {(fin.endeudamientoValue * 100).toFixed(1).replace('.', ',')} % (Máx 60%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded overflow-hidden relative">
                        <div
                          className={`h-full ${
                            fin.evalEndeudamiento === 'CUMPLE' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${endPctBar}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloques 4 y 5: Ofertas Económicas y Orden de Elegibilidad (Solo Habilitadas) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  04. Ofertas Económicas y Orden de Elegibilidad
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Solo compiten las ofertas habilitadas. Compare el efecto de excluir al Proponente
                  C ($1.780M) antes de promediar.
                </p>
              </div>
              <button
                onClick={() => setSimulatePhase1(!simulatePhase1)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                  simulatePhase1
                    ? 'bg-red-50 border-red-300 text-red-900 font-semibold'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {simulatePhase1
                  ? 'Viendo Simulación Fase 1 (Sin filtro previo)'
                  : 'Simular Qué Pasaba en Fase 1 (Con Prop. C)'}
              </button>
            </div>

            {/* Hallazgo Clave de la Página 25 */}
            <div className="mb-4 p-3.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-slate-900">
                Lección de orden del flujo (Sección 8 — Validaciones):
              </div>
              <p>
                El <strong>Proponente C ($1.780.000.000)</strong> tenía la oferta más barata. En la
                Fase 1 entraba al promedio (bajándolo a{' '}
                <span className="font-mono-tabular font-semibold">
                  {formatCOP(phase1EconomicComparison.averageEnabledOffers)}
                </span>
                ) y activaba el filtro de precio artificialmente bajo. En esta <strong>Fase 2</strong>
                , queda excluido en habilitación financiera (Liquidez 1,4 &lt; 2,0), por lo que el
                promedio de las habilitadas sube a{' '}
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {formatCOP(economicSheet.averageEnabledOffers)}
                </span>{' '}
                y el umbral del 85 % queda en{' '}
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {formatCOP(economicSheet.lowPriceThreshold)}
                </span>
                .
              </p>
            </div>

            {/* Tabla de Orden de Elegibilidad */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3">Orden</th>
                    <th className="py-2.5 px-3">Proponente Habilitado</th>
                    <th className="py-2.5 px-3 text-right">Valor Ofertado</th>
                    <th className="py-2.5 px-3">Estado Económico</th>
                    <th className="py-2.5 px-3 text-right">Puntaje (Hoja 3)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {economicSheet.rows
                    .slice()
                    .sort((a, b) => a.ordenElegibilidad - b.ordenElegibilidad)
                    .map((row) => (
                      <tr key={row.proponentId} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono-tabular font-bold text-slate-900">
                          #{row.ordenElegibilidad}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {row.proponentName}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-slate-900">
                          {formatCOP(row.valorOfertado)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              row.estadoEconomico === 'ADMITIDA'
                                ? 'text-emerald-700'
                                : row.estadoEconomico === 'REQUIERE EXPLICACION'
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }`}
                          >
                            {row.estadoEconomico}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono-tabular font-bold text-slate-900">
                          {row.puntaje.toFixed(2).replace('.', ',')} pts
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Proponentes que no llegan a la evaluación económica */}
            {economicSheet.excludedProponents.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Proponentes que no pasan a la Evaluación Económica:
                </div>
                <div className="space-y-1.5">
                  {economicSheet.excludedProponents.map((ex, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs bg-red-50/70 border border-red-200/80 rounded px-3 py-2 text-red-900"
                    >
                      <span className="font-semibold">
                        {ex.proponentName} ({formatCOP(ex.valorOfertado)})
                      </span>
                      <span className="text-[11px] text-red-800">{ex.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              ¿Listo para generar el entregable jurídico publicable?
            </span>
            <button
              onClick={onNavigateToReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Ir al Documento de Evaluación Definitivo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
