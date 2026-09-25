import React, { useState } from 'react';
import {
  PROMPTS_LIBRARY,
  BITACORA_ADJUSTMENTS,
  DIAGNOSTIC_TABLE_1,
  ETHICAL_RISKS_TABLE_4,
  PRIORITY_IMPROVEMENTS_TABLE_6,
  GlossaryEntry,
  TDR_REQUIREMENTS,
  PROCESS_PARAMETERS,
} from '../data/procurementCaseData';
import { formatCOP } from '../utils/spreadsheetEngine';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Plus,
  BookOpen,
  ShieldAlert,
  GitBranch,
  Wrench,
} from 'lucide-react';

interface WorkflowPromptsAndGovernanceViewProps {
  glossary: GlossaryEntry[];
  onAddGlossarySynonym: (glossaryId: string, newSynonym: string) => void;
}

export const WorkflowPromptsAndGovernanceView: React.FC<
  WorkflowPromptsAndGovernanceViewProps
> = ({ glossary, onAddGlossarySynonym }) => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('P3');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runningPrompt, setRunningPrompt] = useState<boolean>(false);
  const [promptOutput, setPromptOutput] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [newSynonymInputs, setNewSynonymInputs] = useState<Record<string, string>>({});

  const activePrompt =
    PROMPTS_LIBRARY.find((p) => p.id === selectedPromptId) || PROMPTS_LIBRARY[0];

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecutePromptInGemini = async () => {
    setRunningPrompt(true);
    setPromptError(null);
    try {
      const response = await fetch('/api/gemini/run-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: activePrompt.promptText,
          contextSummary: JSON.stringify(
            {
              proceso: PROCESS_PARAMETERS,
              requisitos: TDR_REQUIREMENTS,
            },
            null,
            2
          ),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al ejecutar prompt en Gemini');
      }
      setPromptOutput(data.output);
    } catch (err: any) {
      setPromptError(err.message || 'No fue posible ejecutar el prompt.');
    } finally {
      setRunningPrompt(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Diagrama Funcional del Flujo (Figura 1 — Página 8) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-slate-700" />
            <span>Sección 5 · Figura 1 del Proyecto de Aplicación</span>
            <span aria-hidden="true">·</span>
            <span>Jesús Salvador Ríos Rodríguez (2026)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Diagrama Funcional de EVAL-OFERTA GenAI Ampliado a Requisitos Habilitantes
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Arquitectura en tres bloques con partición estricta entre verificación documental (con
            folio citado), cálculo estructurado en hoja de cálculo (con fórmulas visibles) y
            decisión humana del comité.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bloque Izquierdo: ENTRADA */}
          <div className="border border-slate-300 rounded-lg p-5 bg-slate-50/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              01. ENTRADA (Insumos del Proceso)
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">Términos de Referencia (TDR)</div>
              <p className="text-xs text-slate-600">
                7 requisitos habilitantes (técnicos, financieros y garantías), reglas económicas y
                presupuesto oficial ({formatCOP(PROCESS_PARAMETERS.officialBudget)}).
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Respuestas Recibidas (4 Proponentes)
              </div>
              <p className="text-xs text-slate-600">
                Un expediente foliado por proponente (A, B, C y D) con certificaciones, estados
                financieros, pólizas y oferta económica.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">Parámetros Normativos</div>
              <p className="text-xs text-slate-600">
                Liquidez &ge; 2,0 · Endeudamiento &le; 60 % · Garantías 20 % (+6m y +12m) · Umbral
                precio bajo 85 %.
              </p>
            </div>
          </div>

          {/* Bloque Central: PROCESAMIENTO */}
          <div className="border-2 border-slate-900 rounded-lg p-5 bg-white space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              02. PROCESAMIENTO (Reparto y Frontera)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="border border-slate-200 rounded p-3 bg-slate-50">
                <div className="text-xs font-bold text-slate-900">ChatGPT / Gemini (IA)</div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Verifica documentos contra TDR citando el <strong>folio exacto</strong>. Escribe{' '}
                  <strong>FÓRMULAS</strong> dentro de la hoja, nunca resultados.
                </p>
              </div>
              <div className="border border-emerald-300 rounded p-3 bg-emerald-50/50">
                <div className="text-xs font-bold text-emerald-950">
                  Hoja de Cálculo (No es IA)
                </div>
                <p className="text-[11px] text-emerald-900 mt-1">
                  Calcula cocientes de liquidez y endeudamiento, aplica reglas económicas y produce
                  puntaje y orden.
                </p>
              </div>
            </div>
            <div className="border border-slate-200 rounded p-3 bg-slate-50">
              <div className="text-xs font-bold text-slate-900">Gemini (Salidas P4 y P5)</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Redacta el documento definitivo con 6 apartados y construye el tablero HTML
                autocontenido tomando las cifras de la hoja.
              </p>
            </div>
            <div className="border border-amber-300 rounded p-3 bg-amber-50/80">
              <div className="text-xs font-bold text-amber-950">
                Controles que NO se delegan (Gobernanza)
              </div>
              <ul className="text-[11px] text-amber-900 mt-1 space-y-0.5 list-disc pl-4">
                <li>El estado habilitado o no habilitado lo decide el comité.</li>
                <li>El modelo propone el estado y cita el folio que lo respalda.</li>
                <li>Ninguna cifra la produce un modelo: la produce la Hoja.</li>
                <li>
                  Los vacíos se marcan como <span className="font-mono-tabular">NO APORTADO</span> o{' '}
                  <span className="font-mono-tabular">[PENDIENTE DE VERIFICACIÓN]</span>.
                </li>
              </ul>
            </div>
          </div>

          {/* Bloque Derecho: SALIDA */}
          <div className="border border-slate-300 rounded-lg p-5 bg-slate-50/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
              03. SALIDA (Entregables Auditables)
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Matriz de Requisitos Habilitantes
              </div>
              <p className="text-xs text-slate-600">
                28 verificaciones (un renglón por proponente y requisito) con estado propuesto,
                folio de respaldo y casilla del comité.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Hoja de Evaluación (3 Pestañas)
              </div>
              <p className="text-xs text-slate-600">
                Indicadores financieros calculados con fórmula y evaluación económica exclusiva de
                las ofertas habilitadas.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded p-3.5 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                Documento Definitivo y Tablero HTML
              </div>
              <p className="text-xs text-slate-600">
                Informe en Word publicable + Tablero HTML autocontenido para revisión del comité
                antes de firmar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Diseño de los 5 Prompts y Biblioteca de Pruebas (Sección 6.1 a 6.7) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Diseño de los 5 Prompts de Razonamiento Estructurado y Biblioteca de Pruebas (Sección
              6)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleccione cualquiera de los 5 prompts del flujo para inspeccionar su instrucción
              exacta, abrir su enlace de prueba o ejecutarlo en vivo con Gemini.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {PROMPTS_LIBRARY.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPromptId(p.id);
                  setPromptOutput(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedPromptId === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono-tabular font-bold text-slate-900">
                  Paso {activePrompt.stepNumber} de 5
                </span>
                <span>Herramienta: {activePrompt.toolUsed}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{activePrompt.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{activePrompt.purpose}</p>
              <div className="pt-2 border-t border-slate-200 text-xs text-slate-600">
                <strong>Formato de salida exigido:</strong> {activePrompt.outputFormat}
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href={activePrompt.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Evidencia en Biblioteca de Pruebas (Sección 6.7)
                </a>
              </div>
            </div>

            {/* Ajustes en la Bitácora asociados a este Prompt */}
            <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-900">
                Ajustes registrados en la Bitácora (Sección 6.6) para {activePrompt.id}:
              </div>
              {BITACORA_ADJUSTMENTS.filter((b) => b.promptCode === activePrompt.id).map((bit) => (
                <div
                  key={bit.id}
                  className="p-3 bg-amber-50/60 border border-amber-200 rounded text-xs space-y-1"
                >
                  <div>
                    <strong className="text-amber-950">Qué falló:</strong>{' '}
                    <span className="text-slate-700">{bit.whatFailed}</span>
                  </div>
                  <div>
                    <strong className="text-amber-950">Qué cambié:</strong>{' '}
                    <span className="text-slate-700">{bit.whatChanged}</span>
                  </div>
                  <div>
                    <strong className="text-emerald-900">Resultado:</strong>{' '}
                    <span className="text-emerald-800 font-medium">{bit.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Instrucción exacta del {activePrompt.id}:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPrompt(activePrompt.id, activePrompt.promptText)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                >
                  {copiedId === activePrompt.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Prompt
                    </>
                  )}
                </button>
                <button
                  onClick={handleExecutePromptInGemini}
                  disabled={runningPrompt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {runningPrompt ? 'Ejecutando en Gemini...' : 'Probar Prompt con Gemini'}
                </button>
              </div>
            </div>

            <pre className="whitespace-pre-wrap font-mono-tabular text-xs bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-800 leading-relaxed max-h-80 overflow-y-auto">
              {activePrompt.promptText}
            </pre>

            {promptError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                {promptError}
              </div>
            )}

            {promptOutput && (
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Respuesta generada en vivo por Gemini:
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 max-h-64 overflow-y-auto leading-relaxed">
                  {promptOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Glosario de Equivalencias para Objetos Contractuales (Mejora Alta Prioridad Tabla 6) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mejora Prioridad Alta implementada (Tabla 6 — Página 26)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Glosario de Equivalencias para Objetos Contractuales en Certificaciones Reales
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Las certificaciones reales vienen de entidades distintas y con redacciones libres. Este
            glosario alimenta la verificación documental de Gemini para emparejar equivalencias
            válidas sin degradar el control técnico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glossary.map((g) => (
            <div key={g.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{g.canonicalTerm}</span>
                <span className="text-xs font-mono-tabular text-slate-500">
                  Numeral TDR {g.tdrNumeral}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-emerald-800 mb-1">
                  Redacciones equivalentes admitidas:
                </div>
                <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                  {g.acceptedSynonyms.map((syn, idx) => (
                    <li key={idx}>{syn}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newSynonymInputs[g.id] || ''}
                  onChange={(e) =>
                    setNewSynonymInputs((prev) => ({ ...prev, [g.id]: e.target.value }))
                  }
                  placeholder="Agregar nueva equivalencia contractual..."
                  className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800"
                />
                <button
                  onClick={() => {
                    const val = (newSynonymInputs[g.id] || '').trim();
                    if (val) {
                      onAddGlossarySynonym(g.id, val);
                      setNewSynonymInputs((prev) => ({ ...prev, [g.id]: '' }));
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Diagnóstico (Tabla 1), Bitácora Completa (Sección 6.6), Riesgos Éticos (Tabla 4) y Mejoras (Tabla 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla 1: Diagnóstico + Bitácora 6.6 */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tabla 1. Diagnóstico de la Verificación de Requisitos Habilitantes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              El puntaje de 7/15 en complejidad del juicio justifica que el asistente proponga y
              nunca declare.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Criterio</th>
                  <th className="py-2.5 px-3">Puntaje</th>
                  <th className="py-2.5 px-3">Justificación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DIAGNOSTIC_TABLE_1.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row.criterion}</td>
                    <td className="py-2.5 px-3 font-mono-tabular font-bold text-slate-900 whitespace-nowrap">
                      {row.score}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{row.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-slate-700" />
              Tabla 6. Mejoras Priorizadas e Implementadas en esta Plataforma
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-2 px-3">Mejora</th>
                    <th className="py-2 px-3">Prioridad</th>
                    <th className="py-2 px-3">Estado en App</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {PRIORITY_IMPROVEMENTS_TABLE_6.map((imp) => (
                    <tr key={imp.id}>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900">{imp.improvement}</div>
                        <div className="text-[11px] text-slate-500">{imp.whatItFixes}</div>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{imp.priority}</td>
                      <td className="py-2 px-3 text-emerald-800 font-medium">
                        {imp.statusInApp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tabla 4: Riesgos Éticos y Medidas de Mitigación */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              Tabla 4. Riesgos Éticos Identificados y Medidas de Mitigación (Sección 7)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Una equivocación en la parte económica se corrige recalculando; una equivocación en la
              habilitación deja por fuera a quien tenía derecho a competir.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Riesgo Identificado</th>
                  <th className="py-2.5 px-3">Medida de Mitigación del Diseño</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ETHICAL_RISKS_TABLE_4.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 align-top">
                      {r.risk}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 align-top">
                      <div>{r.mitigation}</div>
                      <div className="text-[11px] text-emerald-800 font-medium mt-1">
                        Control activo: {r.implementedInApp}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
