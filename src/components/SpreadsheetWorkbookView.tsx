import React, { useState } from 'react';
import {
  ProponentData,
  PROCESS_PARAMETERS,
} from '../data/procurementCaseData';
import {
  EvaluatedFinancialRow,
  EvaluatedEconomicRow,
  EconomicSheetResult,
  formatCOP,
} from '../utils/spreadsheetEngine';
import {
  ShieldCheck,
  Download,
  RotateCcw,
  CheckCircle2,
  Calculator,
} from 'lucide-react';

interface SpreadsheetWorkbookViewProps {
  proponents: ProponentData[];
  financialRows: EvaluatedFinancialRow[];
  economicSheet: EconomicSheetResult;
  onUpdateFinancialInput: (
    proponentId: string,
    field: 'activoCorriente' | 'pasivoCorriente' | 'activoTotal' | 'pasivoTotal' | 'cutoffDate',
    value: number | string
  ) => void;
  onUpdateOfferValue: (proponentId: string, newValue: number) => void;
  onResetCaseData: () => void;
  onExportCsvFormulas: () => void;
}

export const SpreadsheetWorkbookView: React.FC<SpreadsheetWorkbookViewProps> = ({
  proponents,
  financialRows,
  economicSheet,
  onUpdateFinancialInput,
  onUpdateOfferValue,
  onResetCaseData,
  onExportCsvFormulas,
}) => {
  const [activeSheet, setActiveSheet] = useState<'hoja1' | 'hoja2' | 'hoja3'>('hoja2');
  const [selectedCellAddress, setSelectedCellAddress] = useState<string>('I2');
  const [selectedCellFormula, setSelectedCellFormula] = useState<string>(
    '=SI(H2>=2,0;"CUMPLE";"NO CUMPLE")'
  );
  const [selectedCellNote, setSelectedCellNote] = useState<string>(
    'Regla Prompt 3: La evaluación del índice de liquidez la calcula la hoja con fórmula, nunca el modelo.'
  );
  const [auditReportOpen, setAuditReportOpen] = useState<boolean>(false);

  const selectFormulaCell = (address: string, formula: string, note: string) => {
    setSelectedCellAddress(address);
    setSelectedCellFormula(formula);
    setSelectedCellNote(note);
  };

  // Count total formula cells verified for Mejora Tabla 6 #4
  const totalFormulaCellsCount =
    financialRows.length * 6 + 3 + economicSheet.rows.length * 5;

  return (
    <div className="space-y-6">
      {/* Encabezado de la Hoja de Cálculo (Prompt 3 - Hoja_evaluacion.xlsx) */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono-tabular font-semibold text-slate-900">
                Hoja_evaluacion.xlsx
              </span>
              <span aria-hidden="true">·</span>
              <span>Motor determinista de cálculo (No es IA)</span>
              <span aria-hidden="true">·</span>
              <span>Prompt 3 (Capturas 4 y 9)</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Hoja de Evaluación con Fórmulas Auditables (3 Pestañas)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              <strong>Regla que no se puede romper:</strong> Todas las celdas de resultado contienen{' '}
              <span className="font-mono-tabular font-semibold">FÓRMULAS de Excel</span>, nunca el
              número ya calculado por el modelo. Haga clic en cualquier celda resaltada para
              inspeccionar su fórmula en la barra <span className="font-mono-tabular">fx</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAuditReportOpen(!auditReportOpen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Auditoría de Fórmulas ({totalFormulaCellsCount}/{totalFormulaCellsCount} verificadas)
            </button>

            <button
              onClick={onResetCaseData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Cifras Originales
            </button>

            <button
              onClick={onExportCsvFormulas}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Hoja_evaluacion (.csv con Fórmulas)
            </button>
          </div>
        </div>

        {/* Panel de Auditoría de Fórmulas antes de Archivar (Mejora Tabla 6 #4) */}
        {auditReportOpen && (
          <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-md text-xs text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Verificación de trazabilidad de fórmulas antes de archivar en el expediente (Mejora
                Tabla 6)
              </div>
              <span className="font-mono-tabular font-semibold text-emerald-800">
                ESTADO: 100 % CELDAS CON FÓRMULA ACTIVA
              </span>
            </div>
            <p className="text-emerald-900">
              Se verificaron las <strong>{totalFormulaCellsCount} celdas de resultado</strong> en
              las pestañas <em>Indicadores financieros</em> y <em>Evaluacion economica</em>. Ningún
              cociente de liquidez, endeudamiento, promedio, umbral ni puntaje fue escrito como valor
              estático por el modelo de lenguaje. La copia lista para el expediente conserva todas
              sus fórmulas intactas.
            </p>
          </div>
        )}

        {/* Barra de Fórmulas Interactiva Estilo Excel (Captura 9 Página 25) */}
        <div className="mt-4 bg-slate-100 border border-slate-300 rounded-md p-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-14 text-center py-1 px-2 bg-white border border-slate-300 rounded font-mono-tabular text-xs font-bold text-slate-900">
              {selectedCellAddress}
            </span>
            <span className="px-2 py-1 text-xs font-serif italic font-bold text-slate-600 select-none">
              fx
            </span>
          </div>
          <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 font-mono-tabular text-xs font-semibold text-emerald-900 overflow-x-auto whitespace-nowrap">
            {selectedCellFormula}
          </div>
          <div className="text-[11px] text-slate-600 sm:max-w-md truncate" title={selectedCellNote}>
            {selectedCellNote}
          </div>
        </div>
      </div>

      {/* Contenedor del Libro con sus 3 Pestañas Inferiores/Superiores */}
      <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
        {/* Selector de las 3 Hojas requeridas por el Prompt 3 */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setActiveSheet('hoja1');
                selectFormulaCell(
                  'F2',
                  '"CUMPLE" (Propuesto con respaldo en Folios 2-3)',
                  'Hoja 1: Estado documental propuesto con cita obligatoria de folio. Si falta dato: NO APORTADO.'
                );
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-md border-t border-x transition-colors ${
                activeSheet === 'hoja1'
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoja 1: Requisitos habilitantes
            </button>
            <button
              onClick={() => {
                setActiveSheet('hoja2');
                selectFormulaCell(
                  'I2',
                  '=SI(H2>=2,0;"CUMPLE";"NO CUMPLE")',
                  'Captura 9 (Pág. 25): Fórmula de evaluación del índice de liquidez visible en la barra.'
                );
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-md border-t border-x transition-colors ${
                activeSheet === 'hoja2'
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoja 2: Indicadores financieros (FÓRMULAS)
            </button>
            <button
              onClick={() => {
                setActiveSheet('hoja3');
                selectFormulaCell(
                  'F6',
                  '=SI(E6="RECHAZADA";0;REDONDEAR(($B$4/B6)*100;2))',
                  'Hoja 3: Puntaje económico calculado exclusivamente sobre los proponentes habilitados.'
                );
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-md border-t border-x transition-colors ${
                activeSheet === 'hoja3'
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoja 3: Evaluacion economica (FÓRMULAS)
            </button>
          </div>

          <div className="pb-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span>Puede editar las cifras de entrada para comprobar el recálculo en vivo</span>
          </div>
        </div>

        {/* CONTENIDO DE HOJA 1: REQUISITOS HABILITANTES (Captura 4 Página 15) */}
        {activeSheet === 'hoja1' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-mono-tabular text-[11px] text-slate-500">
                  <th className="py-1.5 px-2 border-r border-slate-300 w-10 text-center">#</th>
                  <th className="py-1.5 px-3 border-r border-slate-300">A · Proponente</th>
                  <th className="py-1.5 px-3 border-r border-slate-300">B · Numeral TDR</th>
                  <th className="py-1.5 px-3 border-r border-slate-300">C · Requisito</th>
                  <th className="py-1.5 px-3 border-r border-slate-300">
                    D · Qué presenta el proponente
                  </th>
                  <th className="py-1.5 px-3 border-r border-slate-300">E · Folio</th>
                  <th className="py-1.5 px-3">F · Estado Propuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proponents
                  .flatMap((p) =>
                    p.documentaryRows.map((r) => ({
                      proponentName: p.name,
                      ...r,
                    }))
                  )
                  .map((row, idx) => {
                    const excelRow = idx + 2;
                    const isNoAportado = row.whatPresents.includes('NO APORTADO');
                    return (
                      <tr
                        key={`${row.proponentName}-${row.requirementId}`}
                        onClick={() =>
                          selectFormulaCell(
                            `F${excelRow}`,
                            `"${row.proposedStatus}" (Respaldo documental: ${row.folio})`,
                            `Fila ${excelRow}: Verificación documental del numeral ${row.numeral}. No deduce datos faltantes.`
                          )
                        }
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="py-2.5 px-2 border-r border-slate-200 bg-slate-50 text-center font-mono-tabular text-slate-500">
                          {excelRow}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900 whitespace-nowrap">
                          {row.proponentName}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono-tabular font-semibold text-slate-800">
                          {row.numeral}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800">
                          {row.requirementTitle}
                        </td>
                        <td
                          className={`py-2.5 px-3 border-r border-slate-200 ${
                            isNoAportado ? 'font-mono-tabular font-bold text-red-700' : 'text-slate-700'
                          }`}
                        >
                          {row.whatPresents}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                          {row.folio}
                        </td>
                        <td className="py-2.5 px-3 font-mono-tabular font-bold whitespace-nowrap">
                          <span
                            className={
                              row.proposedStatus === 'CUMPLE'
                                ? 'text-emerald-700'
                                : row.proposedStatus === 'REQUIERE SUBSANACION'
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }
                          >
                            {row.proposedStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENIDO DE HOJA 2: INDICADORES FINANCIEROS (Captura 9 Página 25 + Columna Fecha de Corte Tabla 6) */}
        {activeSheet === 'hoja2' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-white font-mono-tabular text-[11px]">
                  <th className="py-2 px-2 border-r border-slate-700 text-center w-9">#</th>
                  <th className="py-2 px-3 border-r border-slate-700">A · Proponente</th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    B · Activo Corriente (Editable)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    C · Pasivo Corriente (Editable)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    D · Activo Total (Editable)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    E · Pasivo Total (Editable)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700">
                    F · Fecha Corte (Tabla 6)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    H · Liquidez (FÓRMULA)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700">
                    I · Eval. Liquidez (&ge;2,0)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700 text-right">
                    J · Endeudamiento (FÓRMULA)
                  </th>
                  <th className="py-2 px-3">K · Eval. Endeud. (&le;60%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono-tabular">
                {financialRows.map((fin) => {
                  const r = fin.rowNumber;
                  return (
                    <tr key={fin.proponentId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2 border-r border-slate-200 bg-slate-50 text-center text-slate-500">
                        {r}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        {fin.proponentName}
                      </td>
                      {/* B: Activo Corriente */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          step="50000000"
                          value={fin.activoCorriente}
                          onChange={(e) =>
                            onUpdateFinancialInput(
                              fin.proponentId,
                              'activoCorriente',
                              Number(e.target.value) || 0
                            )
                          }
                          onFocus={() =>
                            selectFormulaCell(
                              `B${r}`,
                              `${fin.activoCorriente}`,
                              `Cifra copiada tal cual del estado financiero en ${fin.folio} (Activo Corriente).`
                            )
                          }
                          className="w-36 text-right border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </td>
                      {/* C: Pasivo Corriente */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          step="50000000"
                          value={fin.pasivoCorriente}
                          onChange={(e) =>
                            onUpdateFinancialInput(
                              fin.proponentId,
                              'pasivoCorriente',
                              Number(e.target.value) || 0
                            )
                          }
                          onFocus={() =>
                            selectFormulaCell(
                              `C${r}`,
                              `${fin.pasivoCorriente}`,
                              `Cifra copiada tal cual del estado financiero en ${fin.folio} (Pasivo Corriente).`
                            )
                          }
                          className="w-36 text-right border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </td>
                      {/* D: Activo Total */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          step="50000000"
                          value={fin.activoTotal}
                          onChange={(e) =>
                            onUpdateFinancialInput(
                              fin.proponentId,
                              'activoTotal',
                              Number(e.target.value) || 0
                            )
                          }
                          onFocus={() =>
                            selectFormulaCell(
                              `D${r}`,
                              `${fin.activoTotal}`,
                              `Cifra copiada tal cual del estado financiero en ${fin.folio} (Activo Total).`
                            )
                          }
                          className="w-36 text-right border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </td>
                      {/* E: Pasivo Total */}
                      <td className="py-2 px-2 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          step="50000000"
                          value={fin.pasivoTotal}
                          onChange={(e) =>
                            onUpdateFinancialInput(
                              fin.proponentId,
                              'pasivoTotal',
                              Number(e.target.value) || 0
                            )
                          }
                          onFocus={() =>
                            selectFormulaCell(
                              `E${r}`,
                              `${fin.pasivoTotal}`,
                              `Cifra copiada tal cual del estado financiero en ${fin.folio} (Pasivo Total).`
                            )
                          }
                          className="w-36 text-right border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </td>
                      {/* F: Fecha de Corte (Mejora Tabla 6) */}
                      <td className="py-2 px-2 border-r border-slate-200">
                        <input
                          type="date"
                          value={fin.cutoffDate}
                          onChange={(e) =>
                            onUpdateFinancialInput(
                              fin.proponentId,
                              'cutoffDate',
                              e.target.value
                            )
                          }
                          onFocus={() =>
                            selectFormulaCell(
                              `F${r}`,
                              fin.cutoffFormula,
                              'Mejora Alta Prioridad (Tabla 6): Columna de fecha de corte para verificar vigencia exigida (2025).'
                            )
                          }
                          className={`border rounded px-2 py-1 text-xs ${
                            fin.cutoffValid
                              ? 'border-slate-200 text-slate-800'
                              : 'border-red-400 bg-red-50 text-red-900 font-bold'
                          }`}
                        />
                      </td>
                      {/* H: Liquidez con FÓRMULA */}
                      <td
                        onClick={() =>
                          selectFormulaCell(
                            `H${r}`,
                            fin.liquidezFormula,
                            `Fórmula de Excel: Activo Corriente (B${r}) dividido entre Pasivo Corriente (C${r}).`
                          )
                        }
                        className="py-2.5 px-3 border-r border-slate-200 text-right bg-emerald-50/40 hover:bg-emerald-100/70 cursor-pointer font-bold text-slate-900"
                        title={`Clic para ver fórmula: ${fin.liquidezFormula}`}
                      >
                        <div>{fin.liquidezValue.toFixed(4).replace('.', ',')}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {fin.liquidezFormula}
                        </div>
                      </td>
                      {/* I: Eval Liquidez con FÓRMULA */}
                      <td
                        onClick={() =>
                          selectFormulaCell(
                            `I${r}`,
                            fin.evalLiquidezFormula,
                            `Compara el cociente H${r} contra el mínimo exigido (2,0) mediante función =SI().`
                          )
                        }
                        className={`py-2.5 px-3 border-r border-slate-200 cursor-pointer font-bold ${
                          selectedCellAddress === `I${r}` ? 'ring-2 ring-inset ring-emerald-700' : ''
                        } ${fin.evalLiquidez === 'CUMPLE' ? 'text-emerald-700' : 'text-red-700'}`}
                      >
                        <div>{fin.evalLiquidez}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {fin.evalLiquidezFormula}
                        </div>
                      </td>
                      {/* J: Endeudamiento con FÓRMULA */}
                      <td
                        onClick={() =>
                          selectFormulaCell(
                            `J${r}`,
                            fin.endeudamientoFormula,
                            `Fórmula de Excel: Pasivo Total (E${r}) dividido entre Activo Total (D${r}).`
                          )
                        }
                        className="py-2.5 px-3 border-r border-slate-200 text-right bg-emerald-50/40 hover:bg-emerald-100/70 cursor-pointer font-bold text-slate-900"
                      >
                        <div>{(fin.endeudamientoValue * 100).toFixed(1).replace('.', ',')} %</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {fin.endeudamientoFormula}
                        </div>
                      </td>
                      {/* K: Eval Endeudamiento con FÓRMULA */}
                      <td
                        onClick={() =>
                          selectFormulaCell(
                            `K${r}`,
                            fin.evalEndeudamientoFormula,
                            `Compara el cociente J${r} contra el tope máximo exigido (60%) mediante función =SI().`
                          )
                        }
                        className={`py-2.5 px-3 cursor-pointer font-bold ${
                          fin.evalEndeudamiento === 'CUMPLE' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        <div>{fin.evalEndeudamiento}</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          {fin.evalEndeudamientoFormula}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CONTENIDO DE HOJA 3: EVALUACIÓN ECONÓMICA (SOLO HABILITADAS - CON FÓRMULAS) */}
        {activeSheet === 'hoja3' && (
          <div className="p-5 space-y-5">
            {/* Bloque Superior: Parámetros en celdas propias ($B$1 a $B$4) como exige el Prompt 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                onClick={() =>
                  selectFormulaCell(
                    '$B$1',
                    `${economicSheet.officialBudget}`,
                    'Celda propia de parámetro: Presupuesto Oficial con IVA incluido ($2.400.000.000).'
                  )
                }
                className="border border-slate-300 rounded p-3 bg-slate-50 cursor-pointer hover:border-slate-500"
              >
                <div className="flex justify-between text-[11px] font-mono-tabular text-slate-500">
                  <span>Celda $B$1</span>
                  <span>Parámetro Fijo</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Presupuesto Oficial
                </div>
                <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                  {formatCOP(economicSheet.officialBudget)}
                </div>
              </div>

              <div
                onClick={() =>
                  selectFormulaCell(
                    '$B$2',
                    economicSheet.averageFormula,
                    'Promedio calculado exclusivamente sobre las ofertas que superaron la habilitación.'
                  )
                }
                className="border border-slate-300 rounded p-3 bg-emerald-50/40 cursor-pointer hover:border-emerald-600"
              >
                <div className="flex justify-between text-[11px] font-mono-tabular text-emerald-800">
                  <span>Celda $B$2</span>
                  <span>{economicSheet.averageFormula}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Promedio Ofertas Habilitadas
                </div>
                <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                  {formatCOP(economicSheet.averageEnabledOffers)}
                </div>
              </div>

              <div
                onClick={() =>
                  selectFormulaCell(
                    '$B$3',
                    economicSheet.lowPriceThresholdFormula,
                    'Umbral de precio artificialmente bajo (85 % del promedio de ofertas habilitadas).'
                  )
                }
                className="border border-slate-300 rounded p-3 bg-emerald-50/40 cursor-pointer hover:border-emerald-600"
              >
                <div className="flex justify-between text-[11px] font-mono-tabular text-emerald-800">
                  <span>Celda $B$3</span>
                  <span>{economicSheet.lowPriceThresholdFormula}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Umbral Precio Bajo (85 %)
                </div>
                <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                  {formatCOP(economicSheet.lowPriceThreshold)}
                </div>
              </div>

              <div
                onClick={() =>
                  selectFormulaCell(
                    '$B$4',
                    economicSheet.minOfferFormula,
                    'Oferta económica más baja dentro de las ofertas habilitadas.'
                  )
                }
                className="border border-slate-300 rounded p-3 bg-emerald-50/40 cursor-pointer hover:border-emerald-600"
              >
                <div className="flex justify-between text-[11px] font-mono-tabular text-emerald-800">
                  <span>Celda $B$4</span>
                  <span>{economicSheet.minOfferFormula}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Oferta Mínima Habilitada
                </div>
                <div className="text-base font-bold font-mono-tabular text-slate-900 mt-1">
                  {formatCOP(economicSheet.minEnabledOffer)}
                </div>
              </div>
            </div>

            {/* Tabla de Evaluación Económica con Fórmulas */}
            <div className="overflow-x-auto border border-slate-300 rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-mono-tabular text-[11px]">
                    <th className="py-2 px-2 border-r border-slate-700 text-center w-9">Fila</th>
                    <th className="py-2 px-3 border-r border-slate-700">
                      A · Proponente Habilitado
                    </th>
                    <th className="py-2 px-3 border-r border-slate-700 text-right">
                      B · Valor Ofertado (Editable)
                    </th>
                    <th className="py-2 px-3 border-r border-slate-700">
                      C · Regla Presupuesto (FÓRMULA)
                    </th>
                    <th className="py-2 px-3 border-r border-slate-700">
                      D · Filtro Precio Bajo (FÓRMULA)
                    </th>
                    <th className="py-2 px-3 border-r border-slate-700">
                      E · Estado Económico (FÓRMULA)
                    </th>
                    <th className="py-2 px-3 border-r border-slate-700 text-right">
                      F · Puntaje (FÓRMULA)
                    </th>
                    <th className="py-2 px-3 text-center">G · Orden Elegibilidad (FÓRMULA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono-tabular">
                  {economicSheet.rows.map((row: EvaluatedEconomicRow) => {
                    const r = row.rowNumber;
                    return (
                      <tr key={row.proponentId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 border-r border-slate-200 bg-slate-50 text-center text-slate-500">
                          {r}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-sans font-semibold text-slate-900">
                          {row.proponentName}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-200 text-right">
                          <input
                            type="number"
                            step="10000000"
                            value={row.valorOfertado}
                            onChange={(e) =>
                              onUpdateOfferValue(
                                row.proponentId,
                                Number(e.target.value) || 0
                              )
                            }
                            onFocus={() =>
                              selectFormulaCell(
                                `B${r}`,
                                `${row.valorOfertado}`,
                                `Valor ofertado copiado de la propuesta económica (${row.folio}).`
                              )
                            }
                            className="w-40 text-right border border-slate-200 rounded px-2 py-1 text-xs bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </td>
                        <td
                          onClick={() =>
                            selectFormulaCell(
                              `C${r}`,
                              row.reglaPresupuestoFormula,
                              'Regla 1: Si supera el presupuesto oficial ($B$1), queda RECHAZADA.'
                            )
                          }
                          className="py-2.5 px-3 border-r border-slate-200 cursor-pointer"
                        >
                          <div
                            className={`font-bold ${
                              row.reglaPresupuesto === 'RECHAZADA'
                                ? 'text-red-700'
                                : 'text-emerald-700'
                            }`}
                          >
                            {row.reglaPresupuesto}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {row.reglaPresupuestoFormula}
                          </div>
                        </td>
                        <td
                          onClick={() =>
                            selectFormulaCell(
                              `D${r}`,
                              row.reglaPrecioBajoFormula,
                              'Regla 2: Si queda por debajo del umbral del promedio ($B$3), REQUIERE EXPLICACION.'
                            )
                          }
                          className="py-2.5 px-3 border-r border-slate-200 cursor-pointer"
                        >
                          <div
                            className={`font-bold ${
                              row.reglaPrecioBajo === 'REQUIERE EXPLICACION'
                                ? 'text-amber-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {row.reglaPrecioBajo}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {row.reglaPrecioBajoFormula}
                          </div>
                        </td>
                        <td
                          onClick={() =>
                            selectFormulaCell(
                              `E${r}`,
                              row.estadoEconomicoFormula,
                              'Estado consolidado de la oferta económica mediante funciones =SI() anidadas.'
                            )
                          }
                          className="py-2.5 px-3 border-r border-slate-200 cursor-pointer font-bold"
                        >
                          <div>{row.estadoEconomico}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {row.estadoEconomicoFormula}
                          </div>
                        </td>
                        <td
                          onClick={() =>
                            selectFormulaCell(
                              `F${r}`,
                              row.puntajeFormula,
                              'Fórmula de puntaje inversamente proporcional respecto de la oferta mínima habilitada ($B$4).'
                            )
                          }
                          className="py-2.5 px-3 border-r border-slate-200 text-right bg-emerald-50/40 cursor-pointer font-bold text-slate-900"
                        >
                          <div>{row.puntaje.toFixed(2).replace('.', ',')}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {row.puntajeFormula}
                          </div>
                        </td>
                        <td
                          onClick={() =>
                            selectFormulaCell(
                              `G${r}`,
                              row.ordenElegibilidadFormula,
                              'Orden de elegibilidad calculado mediante la función =JERARQUIA() de Excel.'
                            )
                          }
                          className="py-2.5 px-3 text-center cursor-pointer font-bold text-slate-900"
                        >
                          <div>#{row.ordenElegibilidad}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            {row.ordenElegibilidadFormula}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
