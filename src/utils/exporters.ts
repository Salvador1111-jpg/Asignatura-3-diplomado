import { ProponentData, PROCESS_PARAMETERS } from '../data/procurementCaseData';
import {
  EvaluatedFinancialRow,
  ProponentSummaryStatus,
  EconomicSheetResult,
  formatCOP,
} from './spreadsheetEngine';

export function downloadStandaloneCommitteeHtml(
  proponents: ProponentData[],
  financialRows: EvaluatedFinancialRow[],
  summaries: ProponentSummaryStatus[],
  economicSheet: EconomicSheetResult
) {
  const totalPresentados = proponents.length;
  const totalHabilitados = summaries.filter((s) => s.overallProposedStatus === 'HABILITADO').length;
  const totalSubsanacion = summaries.filter(
    (s) => s.overallProposedStatus === 'REQUIERE SUBSANACION'
  ).length;
  const totalNoHabilitados = summaries.filter((s) => s.overallProposedStatus === 'NO CUMPLE').length;

  // Build all matrix rows (documentary + financial per proponent)
  const allMatrixRows: {
    proponentName: string;
    component: string;
    numeral: string;
    requirement: string;
    whatPresents: string;
    folio: string;
    proposedStatus: string;
    committeeNote: string;
  }[] = [];

  proponents.forEach((p) => {
    const fin = financialRows.find((f) => f.proponentId === p.id)!;
    // Technical rows
    p.documentaryRows
      .filter((r) => r.component === 'Técnico')
      .forEach((r) => {
        allMatrixRows.push({
          proponentName: p.name,
          component: 'Técnico',
          numeral: r.numeral,
          requirement: r.requirementTitle,
          whatPresents: r.whatPresents,
          folio: r.folio,
          proposedStatus: r.proposedStatus,
          committeeNote: r.committeeObservation || '—',
        });
      });

    // Financial rows from Hoja 2
    allMatrixRows.push({
      proponentName: p.name,
      component: 'Financiero',
      numeral: '5.1',
      requirement: 'Índice de liquidez (>= 2,0)',
      whatPresents: `Activo Cte: ${formatCOP(fin.activoCorriente)} / Pasivo Cte: ${formatCOP(
        fin.pasivoCorriente
      )} -> Liquidez = ${fin.liquidezValue.toFixed(2).replace('.', ',')} (Fórmula: ${
        fin.liquidezFormula
      })`,
      folio: fin.folio,
      proposedStatus: fin.evalLiquidez,
      committeeNote: `Corte: ${fin.cutoffDate}`,
    });

    allMatrixRows.push({
      proponentName: p.name,
      component: 'Financiero',
      numeral: '5.2',
      requirement: 'Índice de endeudamiento (<= 60%)',
      whatPresents: `Pasivo Total: ${formatCOP(fin.pasivoTotal)} / Activo Total: ${formatCOP(
        fin.activoTotal
      )} -> Endeudamiento = ${(fin.endeudamientoValue * 100).toFixed(1).replace('.', ',')}% (Fórmula: ${
        fin.endeudamientoFormula
      })`,
      folio: fin.folio,
      proposedStatus: fin.evalEndeudamiento,
      committeeNote: `Corte: ${fin.cutoffDate}`,
    });

    // Guarantees rows
    p.documentaryRows
      .filter((r) => r.component === 'Garantías')
      .forEach((r) => {
        allMatrixRows.push({
          proponentName: p.name,
          component: 'Garantías',
          numeral: r.numeral,
          requirement: r.requirementTitle,
          whatPresents: r.whatPresents,
          folio: r.folio,
          proposedStatus: r.proposedStatus,
          committeeNote: r.committeeObservation || '—',
        });
      });
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tablero de Revisión — Comité Evaluador (${PROCESS_PARAMETERS.processCode})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      padding: 32px 24px;
      line-height: 1.5;
    }
    .container { max-width: 1280px; margin: 0 auto; }
    .header {
      text-align: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .header h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
    .legend-banner {
      display: inline-block;
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #f59e0b;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 6px 14px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-top: 4px solid #334155;
      border-radius: 6px;
      padding: 18px 16px;
      text-align: center;
    }
    .kpi-card.green { border-top-color: #16a34a; }
    .kpi-card.amber { border-top-color: #d97706; }
    .kpi-card.red { border-top-color: #dc2626; }
    .kpi-label { font-size: 13px; color: #475569; font-weight: 600; margin-bottom: 8px; }
    .kpi-val { font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .section h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
    .filter-bar { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; font-size: 14px; }
    select {
      padding: 6px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 14px;
      background: #fff;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: top;
    }
    th { background-color: #f1f5f9; font-weight: 600; color: #334155; }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-family: monospace; }
    .status-cumple { color: #166534; font-weight: 700; }
    .status-subsanacion { color: #92400e; font-weight: 700; }
    .status-nocumple { color: #991b1b; font-weight: 700; }
    .footer-note { font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tablero de Revisión — Comité Evaluador</h1>
      <div class="legend-banner">ESTADOS PROPUESTOS AL COMITÉ EVALUADOR — LA FIRMA Y HABILITACIÓN NO SE DELEGAN</div>
      <p style="margin-top:8px;font-size:13px;color:#475569;">
        Proceso ${PROCESS_PARAMETERS.processCode} · ${PROCESS_PARAMETERS.object} · Presupuesto Oficial: ${formatCOP(
    PROCESS_PARAMETERS.officialBudget
  )}
      </p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Proponentes Presentados</div>
        <div class="kpi-val">${totalPresentados}</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-label">Habilitados (Propuestos)</div>
        <div class="kpi-val">${totalHabilitados}</div>
      </div>
      <div class="kpi-card amber">
        <div class="kpi-label">Con Subsanación / Explicación</div>
        <div class="kpi-val">${totalSubsanacion}</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-label">No Habilitados</div>
        <div class="kpi-val">${totalNoHabilitados}</div>
      </div>
    </div>

    <div class="section">
      <h2>Matriz de Requisitos por Proponente</h2>
      <div class="filter-bar">
        <label for="compFilter"><strong>Filtrar por Componente:</strong></label>
        <select id="compFilter" onchange="filterTable()">
          <option value="TODOS">Todos los componentes</option>
          <option value="Técnico">Técnico</option>
          <option value="Financiero">Financiero</option>
          <option value="Garantías">Garantías</option>
        </select>
      </div>
      <table id="reqTable">
        <thead>
          <tr>
            <th>Proponente</th>
            <th>Componente</th>
            <th>Numeral</th>
            <th>Requisito</th>
            <th>Qué presenta</th>
            <th>Folio</th>
            <th>Estado Propuesto</th>
            <th>Observación Comité</th>
          </tr>
        </thead>
        <tbody>
          ${allMatrixRows
            .map((r) => {
              const cls =
                r.proposedStatus === 'CUMPLE'
                  ? 'status-cumple'
                  : r.proposedStatus === 'REQUIERE SUBSANACION'
                  ? 'status-subsanacion'
                  : 'status-nocumple';
              return `<tr data-component="${r.component}">
                <td><strong>${r.proponentName}</strong></td>
                <td>${r.component}</td>
                <td class="num">${r.numeral}</td>
                <td>${r.requirement}</td>
                <td>${r.whatPresents}</td>
                <td><strong>${r.folio}</strong></td>
                <td class="${cls}">${r.proposedStatus}</td>
                <td>${r.committeeNote}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Capacidad Financiera (Cifras calculadas en Hoja de Evaluación)</h2>
      <table>
        <thead>
          <tr>
            <th>Proponente</th>
            <th>Corte EE.FF.</th>
            <th class="num">Activo Corriente</th>
            <th class="num">Pasivo Corriente</th>
            <th class="num">Liquidez (>= 2,0)</th>
            <th class="num">Activo Total</th>
            <th class="num">Pasivo Total</th>
            <th class="num">Endeudamiento (<= 60%)</th>
            <th>Estado Financiero</th>
          </tr>
        </thead>
        <tbody>
          ${financialRows
            .map(
              (f) => `<tr>
            <td><strong>${f.proponentName}</strong></td>
            <td>${f.cutoffDate}</td>
            <td class="num">${formatCOP(f.activoCorriente)}</td>
            <td class="num">${formatCOP(f.pasivoCorriente)}</td>
            <td class="num"><strong>${f.liquidezValue.toFixed(2).replace('.', ',')}</strong> (${
                f.evalLiquidez
              })</td>
            <td class="num">${formatCOP(f.activoTotal)}</td>
            <td class="num">${formatCOP(f.pasivoTotal)}</td>
            <td class="num"><strong>${(f.endeudamientoValue * 100)
              .toFixed(1)
              .replace('.', ',')}%</strong> (${f.evalEndeudamiento})</td>
            <td class="${
              f.estadoFinanciero === 'CUMPLE' ? 'status-cumple' : 'status-nocumple'
            }">${f.estadoFinanciero}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Evaluación Económica y Orden de Elegibilidad (Solo Ofertas Habilitadas)</h2>
      <p style="font-size:13px;color:#475569;margin-bottom:14px;">
        Presupuesto Oficial: <strong>${formatCOP(economicSheet.officialBudget)}</strong> · 
        Promedio Ofertas Habilitadas: <strong>${formatCOP(
          economicSheet.averageEnabledOffers
        )}</strong> · 
        Umbral Precio Artificialmente Bajo (85%): <strong>${formatCOP(
          economicSheet.lowPriceThreshold
        )}</strong>
      </p>
      <table>
        <thead>
          <tr>
            <th>Orden</th>
            <th>Proponente Habilitado</th>
            <th class="num">Valor Ofertado</th>
            <th>Control Presupuesto</th>
            <th>Filtro Precio Bajo</th>
            <th>Estado Económico</th>
            <th class="num">Puntaje</th>
          </tr>
        </thead>
        <tbody>
          ${economicSheet.rows
            .slice()
            .sort((a, b) => a.ordenElegibilidad - b.ordenElegibilidad)
            .map(
              (r) => `<tr>
            <td><strong>#${r.ordenElegibilidad}</strong></td>
            <td><strong>${r.proponentName}</strong></td>
            <td class="num">${formatCOP(r.valorOfertado)}</td>
            <td>${r.reglaPresupuesto}</td>
            <td>${r.reglaPrecioBajo}</td>
            <td><strong>${r.estadoEconomico}</strong></td>
            <td class="num"><strong>${r.puntaje.toFixed(2).replace('.', ',')} pts</strong></td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="footer-note">
      Generado por EVAL-OFERTA GenAI (Fase II) · Archivo HTML autocontenido sin dependencias externas para revisión del Comité Evaluador.
    </div>
  </div>

  <script>
    function filterTable() {
      var val = document.getElementById('compFilter').value;
      var rows = document.querySelectorAll('#reqTable tbody tr');
      for (var i = 0; i < rows.length; i++) {
        var comp = rows[i].getAttribute('data-component');
        rows[i].style.display = (val === 'TODOS' || comp === val) ? '' : 'none';
      }
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tablero_revision_comite_${PROCESS_PARAMETERS.processCode}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadExcelFormulasCsv(
  proponents: ProponentData[],
  financialRows: EvaluatedFinancialRow[],
  economicSheet: EconomicSheetResult
) {
  const lines: string[] = [];

  lines.push('=== HOJA 1: REQUISITOS HABILITANTES ===');
  lines.push(
    'Proponente;Componente;Numeral TDR;Requisito;Que presenta el proponente;Folio de respaldo;Estado Propuesto al Comite;Observacion del Comite'
  );
  proponents.forEach((p) => {
    p.documentaryRows.forEach((r) => {
      lines.push(
        `"${p.name}";"${r.component}";"${r.numeral}";"${r.requirementTitle}";"${r.whatPresents.replace(
          /"/g,
          '""'
        )}";"${r.folio}";"${r.proposedStatus}";"${r.committeeObservation.replace(/"/g, '""')}"`
      );
    });
  });

  lines.push('');
  lines.push('=== HOJA 2: INDICADORES FINANCIEROS (CON FORMULAS DE EXCEL) ===');
  lines.push(
    'Fila;Proponente;Activo Corriente (B);Pasivo Corriente (C);Activo Total (D);Pasivo Total (E);Fecha Corte (F);Folio (G);Formula Liquidez (H);Valor Liquidez;Formula Eval Liquidez (I);Formula Endeudamiento (J);Valor Endeudamiento;Formula Eval Endeudamiento (K)'
  );
  financialRows.forEach((f) => {
    lines.push(
      `${f.rowNumber};"${f.proponentName}";${f.activoCorriente};${f.pasivoCorriente};${f.activoTotal};${f.pasivoTotal};"${f.cutoffDate}";"${f.folio}";"${f.liquidezFormula}";${f.liquidezValue.toFixed(
        4
      )};"${f.evalLiquidezFormula}";"${f.endeudamientoFormula}";${(
        f.endeudamientoValue * 100
      ).toFixed(2)}%;"${f.evalEndeudamientoFormula}"`
    );
  });

  lines.push('');
  lines.push('=== HOJA 3: EVALUACION ECONOMICA (SOLO HABILITADAS - CON FORMULAS) ===');
  lines.push(`Parametro $B$1 (Presupuesto Oficial);${economicSheet.officialBudget}`);
  lines.push(
    `Parametro $B$2 (Promedio Habilitadas);Formula: ${economicSheet.averageFormula};Valor: ${Math.round(
      economicSheet.averageEnabledOffers
    )}`
  );
  lines.push(
    `Parametro $B$3 (Umbral Precio Bajo 85%);Formula: ${economicSheet.lowPriceThresholdFormula};Valor: ${Math.round(
      economicSheet.lowPriceThreshold
    )}`
  );
  lines.push(
    `Parametro $B$4 (Oferta Minima Habilitada);Formula: ${economicSheet.minOfferFormula};Valor: ${economicSheet.minEnabledOffer}`
  );
  lines.push(
    'Fila;Proponente Habilitado;Valor Ofertado (B);Formula Regla Presupuesto (C);Formula Regla Precio Bajo (D);Formula Estado (E);Formula Puntaje (F);Puntaje Calculado;Formula Orden Elegibilidad (G);Orden'
  );
  economicSheet.rows.forEach((r) => {
    lines.push(
      `${r.rowNumber};"${r.proponentName}";${r.valorOfertado};"${r.reglaPresupuestoFormula}";"${r.reglaPrecioBajoFormula}";"${r.estadoEconomicoFormula}";"${r.puntajeFormula}";${r.puntaje};"${r.ordenElegibilidadFormula}";${r.ordenElegibilidad}`
    );
  });

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hoja_evaluacion_${PROCESS_PARAMETERS.processCode}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadEvaluationWordDoc(reportHtmlOrText: string, processCode: string) {
  const docTemplate = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>Documento de Evaluación Definitivo - ${processCode}</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #111; }
    h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 14pt; }
    h2 { font-size: 13pt; margin-top: 16pt; margin-bottom: 8pt; border-bottom: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
    th, td { border: 1px solid #666; padding: 6pt; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
  </style>
  </head>
  <body>
    ${reportHtmlOrText}
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', docTemplate], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Documento_Evaluacion_Definitivo_${processCode}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
