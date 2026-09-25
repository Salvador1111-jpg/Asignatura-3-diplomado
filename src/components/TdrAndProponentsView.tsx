import React, { useState } from 'react';
import {
  PROCESS_PARAMETERS,
  TDR_REQUIREMENTS,
  ProponentData,
} from '../data/procurementCaseData';
import { formatCOP } from '../utils/spreadsheetEngine';
import {
  FileText,
  FolderOpen,
  Edit3,
  Check,
} from 'lucide-react';

interface TdrAndProponentsViewProps {
  proponents: ProponentData[];
  onUpdateFolioExcerpt: (proponentId: string, folioNumber: string, newExcerpt: string) => void;
}

export const TdrAndProponentsView: React.FC<TdrAndProponentsViewProps> = ({
  proponents,
  onUpdateFolioExcerpt,
}) => {
  const [selectedProponentId, setSelectedProponentId] = useState<string>(proponents[0]?.id || 'PROP-A');
  const [editingFolio, setEditingFolio] = useState<string | null>(null);
  const [tempExcerpt, setTempExcerpt] = useState<string>('');

  const activeProponent =
    proponents.find((p) => p.id === selectedProponentId) || proponents[0];

  return (
    <div className="space-y-8">
      {/* Bloque 1: Términos de Referencia Generados con Prompt 1 y Tabla 2 de Clasificación */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="border-b border-slate-200 pb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-700" />
              <span>Anexo 1 · Términos de Referencia (Prompt 1)</span>
              <span aria-hidden="true">·</span>
              <span>Tabla 2. Clasificación exploratoria de requisitos</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Términos de Referencia y Partición de Verificación (7 Requisitos Habilitantes)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Partición limpia en dos grupos: los que se resuelven comparando un número contra un
              mínimo (van a la <strong>Hoja de Cálculo</strong>) y los que se resuelven leyendo un
              documento (van al <strong>Modelo con citación obligatoria de Folio</strong>).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs">
            <div className="text-slate-500">Presupuesto Oficial (IVA incluido)</div>
            <div className="text-base font-bold font-mono-tabular text-slate-900">
              {formatCOP(PROCESS_PARAMETERS.officialBudget)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Numeral</th>
                <th className="py-3 px-4">Componente</th>
                <th className="py-3 px-4">Requisito Exigido en los Términos de Referencia</th>
                <th className="py-3 px-4">Cómo se Verifica (Tabla 2)</th>
                <th className="py-3 px-4">Destino en el Flujo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {TDR_REQUIREMENTS.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono-tabular font-bold text-slate-900">
                    {req.numeral}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{req.component}</td>
                  <td className="py-3 px-4 text-slate-800">
                    <div className="font-semibold text-slate-900">{req.title}</div>
                    <div className="text-slate-600 mt-0.5">{req.description}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{req.howVerified}</td>
                  <td className="py-3 px-4 font-mono-tabular font-semibold">
                    {req.verificationNature === 'Cálculo (Hoja con Fórmula)' ? (
                      <span className="text-emerald-800">
                        Hoja de Cálculo ({req.excelFormulaRule})
                      </span>
                    ) : (
                      <span className="text-slate-900">Modelo + Cita de Folio</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloque 2: Los Cuatro Archivos Independientes de Respuesta de los Proponentes (Prompt 2) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <FolderOpen className="w-3.5 h-3.5 text-slate-700" />
              <span>Anexo 2 · Respuestas Foliadas de los Proponentes (Prompt 2)</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Expedientes Foliados Recibidos (Propuesta_Proponente_A, B, C y D)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Puede inspeccionar o editar el texto de cualquier folio (por ejemplo, borrar un dato
              para dejarlo vacío) y luego volver al Tablero para ejecutar la verificación con Gemini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {proponents.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedProponentId(p.id);
                  setEditingFolio(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedProponentId === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>

        {activeProponent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="text-sm font-bold text-slate-900">{activeProponent.name}</div>
                <div className="text-slate-600 mt-0.5">
                  NIT: {activeProponent.nit} · Configuración: {activeProponent.offeredConfiguration}
                </div>
              </div>
              <div className="text-right font-mono-tabular">
                <div className="text-slate-500">Oferta Económica ({activeProponent.economicOfferFolio})</div>
                <div className="text-base font-bold text-slate-900">
                  {formatCOP(activeProponent.economicOfferValue)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProponent.folios.map((folio) => {
                const isEditing = editingFolio === folio.folioNumber;
                return (
                  <div
                    key={folio.folioNumber}
                    className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular font-bold text-xs text-slate-900">
                          {folio.folioNumber}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {folio.documentTitle}
                        </span>
                      </div>
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setEditingFolio(folio.folioNumber);
                            setTempExcerpt(folio.excerpt);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar folio
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onUpdateFolioExcerpt(
                              activeProponent.id,
                              folio.folioNumber,
                              tempExcerpt
                            );
                            setEditingFolio(null);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Guardar
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        value={tempExcerpt}
                        onChange={(e) => setTempExcerpt(e.target.value)}
                        rows={4}
                        className="w-full border border-slate-300 rounded p-2 text-xs font-mono-tabular text-slate-800 focus:outline-none focus:border-slate-900"
                      />
                    ) : (
                      <p className="text-xs font-mono-tabular text-slate-700 whitespace-pre-line leading-relaxed">
                        {folio.excerpt}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
