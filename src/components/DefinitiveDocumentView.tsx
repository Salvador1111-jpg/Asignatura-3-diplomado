import React, { useState, useRef } from 'react';
import {
  ProponentData,
  PROCESS_PARAMETERS,
} from '../data/procurementCaseData';
import {
  EvaluatedFinancialRow,
  ProponentSummaryStatus,
  EconomicSheetResult,
  formatCOP,
} from '../utils/spreadsheetEngine';
import { downloadEvaluationWordDoc } from '../utils/exporters';
import {
  FileDown,
  Sparkles,
  Printer,
  CheckSquare,
  FileCheck,
} from 'lucide-react';

interface DefinitiveDocumentViewProps {
  proponents: ProponentData[];
  financialRows: EvaluatedFinancialRow[];
  summaries: ProponentSummaryStatus[];
  economicSheet: EconomicSheetResult;
}

export const DefinitiveDocumentView: React.FC<DefinitiveDocumentViewProps> = ({
  proponents,
  financialRows,
  summaries,
  economicSheet,
}) => {
  const [aiDraftText, setAiDraftText] = useState<string | null>(null);
  const [isGeneratingAiDraft, setIsGeneratingAiDraft] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [committeeSigned, setCommitteeSigned] = useState<boolean>(false);
  const documentContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerateWithGemini = async () => {
    setIsGeneratingAiDraft(true);
    setAiError(null);
    try {
      const response = await fetch('/api/gemini/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processInfo: PROCESS_PARAMETERS,
          spreadsheetData: {
            proponentsSummary: summaries,
            hoja1_requisitos: proponents.map((p) => ({
              proponent: p.name,
              offerValue: formatCOP(p.economicOfferValue),
              rows: p.documentaryRows,
            })),
            hoja2_financieros: financialRows,
            hoja3_economica: economicSheet,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al generar redacción con Gemini');
      }
      setAiDraftText(data.reportText);
    } catch (err: any) {
      setAiError(err.message || 'No fue posible conectar con el servidor Gemini.');
    } finally {
      setIsGeneratingAiDraft(false);
    }
  };

  const handleExportWord = () => {
    if (documentContainerRef.current) {
      downloadEvaluationWordDoc(
        documentContainerRef.current.innerHTML,
        PROCESS_PARAMETERS.processCode
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Control del Entregable Oficial (Prompt 4 - Captura 6) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-mono-tabular font-semibold text-slate-900">
              Prompt 4 · Entregable Oficial Publicable
            </span>
            <span aria-hidden="true">·</span>
            <span>6 Apartados Numerados con Tablas Reales</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Documento de Evaluación Definitivo (Listo para Exportar a Word)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Reúne la verificación habilitante (técnica, financiera y garantías) y la evaluación
            económica en un solo texto formal. Toma exclusivamente las cifras de la hoja de cálculo
            y presenta los estados como <strong>PROPUESTOS al comité evaluador</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateWithGemini}
            disabled={isGeneratingAiDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-700" />
            {isGeneratingAiDraft
              ? 'Redactando con Gemini (Prompt 4)...'
              : 'Ejecutar Prompt 4 en Vivo con Gemini'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>

          <button
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5" />
            Exportar a Word (.doc)
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
          {aiError}
        </div>
      )}

      {aiDraftText && (
        <div className="bg-white border border-slate-300 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              Redacción generada en vivo por Gemini ejecutando el Prompt 4 sobre la Hoja de
              Evaluación actual
            </div>
            <button
              onClick={() => setAiDraftText(null)}
              className="text-xs text-slate-500 hover:text-slate-900"
            >
              Cerrar vista de salida cruda
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-slate-50 p-4 rounded border border-slate-200 max-h-96 overflow-y-auto">
            {aiDraftText}
          </pre>
        </div>
      )}

      {/* Hoja de Papel Institucional estilo Google Docs / Word (Captura 6 Página 17) */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-xs max-w-5xl mx-auto p-8 sm:p-12 text-slate-900">
        <div ref={documentContainerRef} className="space-y-8 text-sm leading-relaxed">
          {/* Título Oficial */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="text-xs font-mono-tabular uppercase tracking-wider text-slate-500 mb-2">
              {PROCESS_PARAMETERS.entityName} · Proceso {PROCESS_PARAMETERS.processCode}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 uppercase">
              DOCUMENTO DE EVALUACIÓN DEFINITIVO
            </h1>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Nota de alcance metodológico: Los estados de verificación habilitante consignados en el
              presente informe tienen el carácter de <strong>PROPUESTOS al Comité Evaluador</strong>{' '}
              con cita expresa del numeral de los Términos de Referencia y el folio del expediente.
              Los cocientes financieros y puntajes económicos provienen directamente de las fórmulas
              de la Hoja de Evaluación adjunta.
            </p>
          </div>

          {/* Apartado 1: Identificación del proceso */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              1. Identificación del proceso
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-800">
              <li>
                <strong>Código del Proceso:</strong> {PROCESS_PARAMETERS.processCode}
              </li>
              <li>
                <strong>Objeto:</strong> {PROCESS_PARAMETERS.object}.
              </li>
              <li>
                <strong>Modalidad:</strong> {PROCESS_PARAMETERS.modality}.
              </li>
              <li>
                <strong>Presupuesto Oficial:</strong>{' '}
                <span className="font-mono-tabular font-semibold">
                  {formatCOP(PROCESS_PARAMETERS.officialBudget)}
                </span>{' '}
                (IVA incluido) — Plazo de ejecución: {PROCESS_PARAMETERS.executionTermMonths} meses.
              </li>
              <li>
                <strong>Fecha de cierre:</strong> {PROCESS_PARAMETERS.closingDate}.
              </li>
            </ul>
          </section>

          {/* Apartado 2: Proponentes que participaron */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              2. Proponentes que participaron
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              A continuación se detallan los oferentes presentados al cierre del proceso, indicando
              el valor total de su oferta cada vez que se nombra y la configuración técnica ofrecida:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2.5 text-left">Proponente</th>
                    <th className="border border-slate-300 p-2.5 text-right">Valor Ofertado</th>
                    <th className="border border-slate-300 p-2.5 text-left">Folio Oferta</th>
                    <th className="border border-slate-300 p-2.5 text-left">
                      Configuración Técnica Ofrecida
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proponents.map((p) => (
                    <tr key={p.id}>
                      <td className="border border-slate-300 p-2.5 font-semibold">
                        {p.name} ({formatCOP(p.economicOfferValue)})
                      </td>
                      <td className="border border-slate-300 p-2.5 text-right font-mono-tabular font-semibold">
                        {formatCOP(p.economicOfferValue)}
                      </td>
                      <td className="border border-slate-300 p-2.5 font-mono-tabular">
                        {p.economicOfferFolio}
                      </td>
                      <td className="border border-slate-300 p-2.5">{p.offeredConfiguration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Apartado 3: Verificación técnica */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              3. Verificación técnica (Numerales 4.1, 4.2 y 4.3 de los Términos de Referencia)
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Se relacionan los hallazgos documentales requisito por requisito, con el numeral de
              los términos de referencia y el folio de respaldo. Todos los estados se someten como{' '}
              <strong>PROPUESTOS al Comité Evaluador</strong>:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">
                      Proponente (Valor Oferta)
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Numeral</th>
                    <th className="border border-slate-300 p-2 text-left">Requisito Técnico</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Acreditación Aportada
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Folio</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Estado Propuesto al Comité
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proponents.flatMap((p) =>
                    p.documentaryRows
                      .filter((r) => r.component === 'Técnico')
                      .map((r) => (
                        <tr key={`${p.id}-${r.requirementId}`}>
                          <td className="border border-slate-300 p-2 font-medium">
                            {p.name} ({formatCOP(p.economicOfferValue)})
                          </td>
                          <td className="border border-slate-300 p-2 font-mono-tabular">
                            {r.numeral}
                          </td>
                          <td className="border border-slate-300 p-2">{r.requirementTitle}</td>
                          <td className="border border-slate-300 p-2">{r.whatPresents}</td>
                          <td className="border border-slate-300 p-2 font-mono-tabular font-semibold">
                            {r.folio}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {r.proposedStatus} (Propuesto)
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Apartado 4: Verificación de capacidad financiera */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              4. Verificación de capacidad financiera (Numerales 5.1 y 5.2 de los Términos de
              Referencia)
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Los indicadores de liquidez (Numeral 5.1: mínimo exigido &ge; 2,0) y endeudamiento
              (Numeral 5.2: máximo permitido &le; 60 %) fueron calculados mediante fórmulas en la
              Hoja 2 a partir de los estados financieros aportados en el Folio 6 de cada propuesta:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">
                      Proponente (Valor Oferta)
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Folio / Corte</th>
                    <th className="border border-slate-300 p-2 text-right">
                      Índice Liquidez (&ge; 2,0)
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Índice Endeudamiento (&le; 60%)
                    </th>
                    <th className="border border-slate-300 p-2 text-left">
                      Estado Financiero Propuesto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {financialRows.map((f) => {
                    const prop = proponents.find((p) => p.id === f.proponentId)!;
                    return (
                      <tr key={f.proponentId}>
                        <td className="border border-slate-300 p-2 font-medium">
                          {f.proponentName} ({formatCOP(prop.economicOfferValue)})
                        </td>
                        <td className="border border-slate-300 p-2 font-mono-tabular">
                          {f.folio} (Corte {f.cutoffDate})
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono-tabular">
                          <strong>{f.liquidezValue.toFixed(2).replace('.', ',')}</strong> (
                          {f.evalLiquidez})
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono-tabular">
                          <strong>
                            {(f.endeudamientoValue * 100).toFixed(1).replace('.', ',')} %
                          </strong>{' '}
                          ({f.evalEndeudamiento})
                        </td>
                        <td className="border border-slate-300 p-2 font-bold">
                          {f.estadoFinanciero} (Propuesto)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Apartado 5: Verificación de garantías */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              5. Verificación de garantías (Numerales 6.1 y 6.2 de los Términos de Referencia)
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Se confrontaron los amparos, porcentajes asegurados (20 %) y vigencias exigidas para
              Cumplimiento (Numeral 6.1: plazo + 6 meses) y Calidad del Servicio (Numeral 6.2:
              plazo + 1 año):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left">
                      Proponente (Valor Oferta)
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Numeral</th>
                    <th className="border border-slate-300 p-2 text-left">Amparo Exigido</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Póliza / Vigencia Presentada
                    </th>
                    <th className="border border-slate-300 p-2 text-left">Folio</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Estado Propuesto al Comité
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proponents.flatMap((p) =>
                    p.documentaryRows
                      .filter((r) => r.component === 'Garantías')
                      .map((r) => (
                        <tr key={`${p.id}-${r.requirementId}`}>
                          <td className="border border-slate-300 p-2 font-medium">
                            {p.name} ({formatCOP(p.economicOfferValue)})
                          </td>
                          <td className="border border-slate-300 p-2 font-mono-tabular">
                            {r.numeral}
                          </td>
                          <td className="border border-slate-300 p-2">{r.requirementTitle}</td>
                          <td className="border border-slate-300 p-2">{r.whatPresents}</td>
                          <td className="border border-slate-300 p-2 font-mono-tabular font-semibold">
                            {r.folio}
                          </td>
                          <td className="border border-slate-300 p-2 font-bold">
                            {r.proposedStatus} (Propuesto)
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Apartado 6: Evaluación económica de las habilitadas */}
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              6. Evaluación económica de las ofertas habilitadas
            </h2>
            <p className="text-xs sm:text-sm text-slate-700">
              Conforme a las reglas del proceso, únicamente participan en la evaluación económica
              las propuestas habilitadas. La oferta de{' '}
              <strong>Proponente C — TechNova SAS ($1.780.000.000)</strong> no ingresa al cálculo
              del promedio ni a la asignación de puntaje por presentar estado propuesto{' '}
              <strong>NO CUMPLE</strong> en los indicadores financieros (Liquidez 1,40 frente a 2,0
              exigido y Endeudamiento 71,0 % frente a 60 % permitido, Folio 6).
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs font-mono-tabular space-y-1">
              <div>
                • Promedio de las ofertas habilitadas (Celda $B$2):{' '}
                <strong>{formatCOP(economicSheet.averageEnabledOffers)}</strong>
              </div>
              <div>
                • Umbral de precio artificialmente bajo — 85 % del promedio (Celda $B$3):{' '}
                <strong>{formatCOP(economicSheet.lowPriceThreshold)}</strong>
              </div>
              <div>
                • Oferta mínima habilitada (Celda $B$4):{' '}
                <strong>{formatCOP(economicSheet.minEnabledOffer)}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-center">
                      Orden de Elegibilidad
                    </th>
                    <th className="border border-slate-300 p-2 text-left">
                      Proponente Habilitado (Valor Oferta)
                    </th>
                    <th className="border border-slate-300 p-2 text-right">Valor Ofertado</th>
                    <th className="border border-slate-300 p-2 text-left">
                      Control Presupuesto Oficial
                    </th>
                    <th className="border border-slate-300 p-2 text-left">
                      Filtro Precio Artificialmente Bajo
                    </th>
                    <th className="border border-slate-300 p-2 text-right">Puntaje Obtenido</th>
                  </tr>
                </thead>
                <tbody>
                  {economicSheet.rows
                    .slice()
                    .sort((a, b) => a.ordenElegibilidad - b.ordenElegibilidad)
                    .map((row) => (
                      <tr key={row.proponentId}>
                        <td className="border border-slate-300 p-2 text-center font-mono-tabular font-bold">
                          #{row.ordenElegibilidad}
                        </td>
                        <td className="border border-slate-300 p-2 font-semibold">
                          {row.proponentName} ({formatCOP(row.valorOfertado)})
                        </td>
                        <td className="border border-slate-300 p-2 text-right font-mono-tabular">
                          {formatCOP(row.valorOfertado)} ({row.folio})
                        </td>
                        <td className="border border-slate-300 p-2">{row.reglaPresupuesto}</td>
                        <td className="border border-slate-300 p-2">{row.reglaPrecioBajo}</td>
                        <td className="border border-slate-300 p-2 text-right font-mono-tabular font-bold">
                          {row.puntaje.toFixed(2).replace('.', ',')} puntos
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bloque de Decisión y Firma del Comité Evaluador (No delegable) */}
          <section className="pt-6 border-t-2 border-slate-300 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded p-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Constancia de Revisión Humana y Firma del Comité Evaluador
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Regla de diseño de EVAL-OFERTA GenAI: &ldquo;La IA prepara el material, el comité
                  decide y firma.&rdquo;
                </p>
              </div>
              <button
                onClick={() => setCommitteeSigned(!committeeSigned)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                  committeeSigned
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {committeeSigned ? (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    Acta Validada por el Comité
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    Registrar Firma del Comité Evaluador
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs text-center">
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">Evaluador Técnico — Infraestructura</div>
                <div className="text-slate-500">Verificación Numerales 4.1 a 4.3</div>
                {committeeSigned && (
                  <div className="mt-1 font-mono-tabular text-[11px] text-emerald-700 font-semibold">
                    [FIRMADO CONFORME]
                  </div>
                )}
              </div>
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">Evaluador Financiero y Económico</div>
                <div className="text-slate-500">Auditoría Fórmulas Hoja 2 y Hoja 3</div>
                {committeeSigned && (
                  <div className="mt-1 font-mono-tabular text-[11px] text-emerald-700 font-semibold">
                    [FIRMADO CONFORME]
                  </div>
                )}
              </div>
              <div className="border-t border-slate-400 pt-2">
                <div className="font-bold text-slate-900">Evaluador Jurídico — Contratación</div>
                <div className="text-slate-500">Calificación Subsanabilidad y Garantías</div>
                {committeeSigned && (
                  <div className="mt-1 font-mono-tabular text-[11px] text-emerald-700 font-semibold">
                    [FIRMADO CONFORME]
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
