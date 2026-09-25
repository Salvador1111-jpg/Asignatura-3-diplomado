import {
  ProponentData,
  PROCESS_PARAMETERS,
  ProposedStatus,
} from '../data/procurementCaseData';

export interface EvaluatedFinancialRow {
  proponentId: string;
  proponentCode: string;
  proponentName: string;
  rowNumber: number;
  cutoffDate: string;
  cutoffValid: boolean;
  cutoffFormula: string;
  activoCorriente: number;
  pasivoCorriente: number;
  activoTotal: number;
  pasivoTotal: number;
  folio: string;
  liquidezValue: number;
  liquidezFormula: string;
  evalLiquidez: 'CUMPLE' | 'NO CUMPLE';
  evalLiquidezFormula: string;
  endeudamientoValue: number; // decimal e.g. 0.42
  endeudamientoFormula: string;
  evalEndeudamiento: 'CUMPLE' | 'NO CUMPLE';
  evalEndeudamientoFormula: string;
  estadoFinanciero: 'CUMPLE' | 'NO CUMPLE';
  estadoFinancieroFormula: string;
}

export interface ProponentSummaryStatus {
  proponentId: string;
  code: string;
  name: string;
  economicOfferValue: number;
  offeredConfiguration: string;
  tecnicosSummary: string;
  tecnicosStatus: ProposedStatus;
  financierosSummary: string;
  financierosStatus: 'CUMPLE' | 'NO CUMPLE';
  garantiasSummary: string;
  garantiasStatus: ProposedStatus;
  overallProposedStatus: 'HABILITADO' | 'REQUIERE SUBSANACION' | 'NO CUMPLE';
  committeeDecision: string;
  passesToEconomicEvaluation: boolean;
  exclusionReason?: string;
}

export interface EvaluatedEconomicRow {
  proponentId: string;
  proponentCode: string;
  proponentName: string;
  rowNumber: number;
  valorOfertado: number;
  folio: string;
  reglaPresupuesto: 'DENTRO DEL TECHO' | 'RECHAZADA';
  reglaPresupuestoFormula: string;
  reglaPrecioBajo: 'NORMAL' | 'REQUIERE EXPLICACION';
  reglaPrecioBajoFormula: string;
  estadoEconomico: 'ADMITIDA' | 'REQUIERE EXPLICACION' | 'RECHAZADA';
  estadoEconomicoFormula: string;
  puntaje: number;
  puntajeFormula: string;
  ordenElegibilidad: number;
  ordenElegibilidadFormula: string;
}

export interface EconomicSheetResult {
  officialBudget: number;
  averageEnabledOffers: number;
  averageFormula: string;
  lowPriceThreshold: number;
  lowPriceThresholdFormula: string;
  minEnabledOffer: number;
  minOfferFormula: string;
  rows: EvaluatedEconomicRow[];
  excludedProponents: {
    proponentName: string;
    valorOfertado: number;
    reason: string;
  }[];
}

export function evaluateFinancialSheet(proponents: ProponentData[]): EvaluatedFinancialRow[] {
  return proponents.map((p, idx) => {
    const rowNumber = idx + 2; // Row 1 is headers
    const { activoCorriente, pasivoCorriente, activoTotal, pasivoTotal, cutoffDate, folio } =
      p.financials;

    const liquidezValue = pasivoCorriente > 0 ? activoCorriente / pasivoCorriente : 0;
    const evalLiquidez: 'CUMPLE' | 'NO CUMPLE' =
      liquidezValue >= PROCESS_PARAMETERS.minLiquidityIndex ? 'CUMPLE' : 'NO CUMPLE';

    const endeudamientoValue = activoTotal > 0 ? pasivoTotal / activoTotal : 1;
    const evalEndeudamiento: 'CUMPLE' | 'NO CUMPLE' =
      endeudamientoValue <= PROCESS_PARAMETERS.maxIndebtednessIndex ? 'CUMPLE' : 'NO CUMPLE';

    const cutoffValid = cutoffDate.startsWith(String(PROCESS_PARAMETERS.requiredFinancialCutoffYear));

    const estadoFinanciero: 'CUMPLE' | 'NO CUMPLE' =
      evalLiquidez === 'CUMPLE' && evalEndeudamiento === 'CUMPLE' && cutoffValid
        ? 'CUMPLE'
        : 'NO CUMPLE';

    return {
      proponentId: p.id,
      proponentCode: p.code,
      proponentName: p.name,
      rowNumber,
      cutoffDate,
      cutoffValid,
      cutoffFormula: `=SI(AÑO(F${rowNumber})=${PROCESS_PARAMETERS.requiredFinancialCutoffYear};"VIGENTE";"VENCIDO")`,
      activoCorriente,
      pasivoCorriente,
      activoTotal,
      pasivoTotal,
      folio,
      liquidezValue,
      liquidezFormula: `=B${rowNumber}/C${rowNumber}`,
      evalLiquidez,
      evalLiquidezFormula: `=SI(H${rowNumber}>=2,0;"CUMPLE";"NO CUMPLE")`,
      endeudamientoValue,
      endeudamientoFormula: `=E${rowNumber}/D${rowNumber}`,
      evalEndeudamiento,
      evalEndeudamientoFormula: `=SI(J${rowNumber}<=0,60;"CUMPLE";"NO CUMPLE")`,
      estadoFinanciero,
      estadoFinancieroFormula: `=SI(Y(H${rowNumber}>=2,0;J${rowNumber}<=0,60);"CUMPLE";"NO CUMPLE")`,
    };
  });
}

export function summarizeProponentsEnabling(
  proponents: ProponentData[],
  financialRows: EvaluatedFinancialRow[],
  includeSubsanacionInEconomic: boolean = true
): ProponentSummaryStatus[] {
  return proponents.map((p) => {
    const fin = financialRows.find((f) => f.proponentId === p.id)!;
    const techRows = p.documentaryRows.filter((r) => r.component === 'Técnico');
    const guarRows = p.documentaryRows.filter((r) => r.component === 'Garantías');

    // Technical status
    let tecnicosStatus: ProposedStatus = 'CUMPLE';
    let tecnicosSummary = 'Cumple';
    const techNoCumple = techRows.find((r) => r.proposedStatus === 'NO CUMPLE');
    const techSubsanacion = techRows.find((r) => r.proposedStatus === 'REQUIERE SUBSANACION');
    if (techNoCumple) {
      tecnicosStatus = 'NO CUMPLE';
      tecnicosSummary = techNoCumple.whatPresents;
    } else if (techSubsanacion) {
      tecnicosStatus = 'REQUIERE SUBSANACION';
      if (techSubsanacion.whatPresents.toLowerCase().includes('vencido')) {
        tecnicosSummary = 'Certificado del fabricante vencido';
      } else if (techSubsanacion.whatPresents.includes('NO APORTADO')) {
        tecnicosSummary = 'Certificado de ingeniero NO APORTADO';
      } else {
        tecnicosSummary = techSubsanacion.requirementTitle;
      }
    }

    // Financial summary
    const liqFormatted = fin.liquidezValue.toFixed(1).replace('.', ',');
    const endFormatted = Math.round(fin.endeudamientoValue * 100);
    const financierosSummary = `Liquidez ${liqFormatted} · Endeud. ${endFormatted} %`;
    const financierosStatus = fin.estadoFinanciero;

    // Guarantees status
    let garantiasStatus: ProposedStatus = 'CUMPLE';
    let garantiasSummary = 'Completas';
    const guarNoCumple = guarRows.find((r) => r.proposedStatus === 'NO CUMPLE');
    const guarSubsanacion = guarRows.find((r) => r.proposedStatus === 'REQUIERE SUBSANACION');
    if (guarNoCumple) {
      garantiasStatus = 'NO CUMPLE';
      garantiasSummary = guarNoCumple.whatPresents;
    } else if (guarSubsanacion) {
      garantiasStatus = 'REQUIERE SUBSANACION';
      if (guarSubsanacion.whatPresents.toLowerCase().includes('tres (3) meses')) {
        garantiasSummary = 'Cumplimiento vigente solo tres meses más';
      } else if (guarSubsanacion.whatPresents.includes('NO APORTADO')) {
        garantiasSummary = 'Póliza calidad NO APORTADO';
      } else {
        garantiasSummary = guarSubsanacion.requirementTitle;
      }
    }

    // Overall proposed status
    let overallProposedStatus: 'HABILITADO' | 'REQUIERE SUBSANACION' | 'NO CUMPLE' = 'HABILITADO';
    if (
      financierosStatus === 'NO CUMPLE' ||
      tecnicosStatus === 'NO CUMPLE' ||
      garantiasStatus === 'NO CUMPLE'
    ) {
      overallProposedStatus = 'NO CUMPLE';
    } else if (
      tecnicosStatus === 'REQUIERE SUBSANACION' ||
      garantiasStatus === 'REQUIERE SUBSANACION'
    ) {
      overallProposedStatus = 'REQUIERE SUBSANACION';
    }

    // Determine whether it passes to Hoja 3 (Economic Evaluation)
    // By default, HABILITADO and subsanable proponents that the committee enables (or if includeSubsanacionInEconomic is active) pass, while NO CUMPLE (like Proponent C) is strictly excluded.
    let passesToEconomicEvaluation = false;
    let exclusionReason: string | undefined = undefined;

    if (overallProposedStatus === 'NO CUMPLE' || p.committeeGlobalDecision === 'RECHAZADO / NO HABILITADO') {
      passesToEconomicEvaluation = false;
      exclusionReason =
        financierosStatus === 'NO CUMPLE'
          ? `Excluido en habilitación financiera: Liquidez ${liqFormatted} (mín. 2,0) y Endeudamiento ${endFormatted}% (máx. 60%).`
          : 'Excluido por incumplimiento de requisitos habilitantes.';
    } else if (overallProposedStatus === 'HABILITADO' || p.committeeGlobalDecision === 'HABILITADO POR COMITÉ') {
      passesToEconomicEvaluation = true;
    } else {
      passesToEconomicEvaluation = includeSubsanacionInEconomic;
      if (!passesToEconomicEvaluation) {
        exclusionReason = `Pendiente de subsanación documental (${tecnicosStatus !== 'CUMPLE' ? tecnicosSummary : garantiasSummary}).`;
      }
    }

    return {
      proponentId: p.id,
      code: p.code,
      name: p.name,
      economicOfferValue: p.economicOfferValue,
      offeredConfiguration: p.offeredConfiguration,
      tecnicosSummary,
      tecnicosStatus,
      financierosSummary,
      financierosStatus,
      garantiasSummary,
      garantiasStatus,
      overallProposedStatus,
      committeeDecision: p.committeeGlobalDecision,
      passesToEconomicEvaluation,
      exclusionReason,
    };
  });
}

export function evaluateEconomicSheet(
  proponents: ProponentData[],
  summaries: ProponentSummaryStatus[],
  simulatePhase1WithoutFilter: boolean = false
): EconomicSheetResult {
  const officialBudget = PROCESS_PARAMETERS.officialBudget;

  const enabledProponents = proponents.filter((p) => {
    if (simulatePhase1WithoutFilter) return true;
    const s = summaries.find((sum) => sum.proponentId === p.id);
    return s ? s.passesToEconomicEvaluation : false;
  });

  const excludedProponents = proponents
    .filter((p) => !enabledProponents.some((ep) => ep.id === p.id))
    .map((p) => {
      const s = summaries.find((sum) => sum.proponentId === p.id);
      return {
        proponentName: p.name,
        valorOfertado: p.economicOfferValue,
        reason: s?.exclusionReason || 'No habilitado en verificación previa.',
      };
    });

  const lastRow = 5 + enabledProponents.length;
  const rangeStr = enabledProponents.length > 0 ? `B6:B${lastRow}` : 'B6:B6';

  const averageEnabledOffers =
    enabledProponents.length > 0
      ? enabledProponents.reduce((acc, p) => acc + p.economicOfferValue, 0) /
        enabledProponents.length
      : 0;

  const lowPriceThreshold = averageEnabledOffers * PROCESS_PARAMETERS.lowPriceThresholdRatio;

  const validUnderBudget = enabledProponents.filter((p) => p.economicOfferValue <= officialBudget);
  const minEnabledOffer =
    validUnderBudget.length > 0
      ? Math.min(...validUnderBudget.map((p) => p.economicOfferValue))
      : 0;

  // Build rows and compute scores
  const prelimRows = enabledProponents.map((p, idx) => {
    const rowNumber = 6 + idx; // Rows 1-4 are parameters, Row 5 is table header
    const valorOfertado = p.economicOfferValue;

    const reglaPresupuesto: 'DENTRO DEL TECHO' | 'RECHAZADA' =
      valorOfertado > officialBudget ? 'RECHAZADA' : 'DENTRO DEL TECHO';

    const reglaPrecioBajo: 'NORMAL' | 'REQUIERE EXPLICACION' =
      valorOfertado < lowPriceThreshold ? 'REQUIERE EXPLICACION' : 'NORMAL';

    let estadoEconomico: 'ADMITIDA' | 'REQUIERE EXPLICACION' | 'RECHAZADA' = 'ADMITIDA';
    if (reglaPresupuesto === 'RECHAZADA') {
      estadoEconomico = 'RECHAZADA';
    } else if (reglaPrecioBajo === 'REQUIERE EXPLICACION') {
      estadoEconomico = 'REQUIERE EXPLICACION';
    }

    const puntaje =
      reglaPresupuesto === 'RECHAZADA' || valorOfertado <= 0
        ? 0
        : Number(((minEnabledOffer / valorOfertado) * 100).toFixed(2));

    return {
      proponentId: p.id,
      proponentCode: p.code,
      proponentName: p.name,
      rowNumber,
      valorOfertado,
      folio: p.economicOfferFolio,
      reglaPresupuesto,
      reglaPresupuestoFormula: `=SI(B${rowNumber}>$B$1;"RECHAZADA";"DENTRO DEL TECHO")`,
      reglaPrecioBajo,
      reglaPrecioBajoFormula: `=SI(B${rowNumber}<$B$3;"REQUIERE EXPLICACION";"NORMAL")`,
      estadoEconomico,
      estadoEconomicoFormula: `=SI(C${rowNumber}="RECHAZADA";"RECHAZADA";SI(D${rowNumber}="REQUIERE EXPLICACION";"REQUIERE EXPLICACION";"ADMITIDA"))`,
      puntaje,
      puntajeFormula: `=SI(E${rowNumber}="RECHAZADA";0;REDONDEAR(($B$4/B${rowNumber})*100;2))`,
    };
  });

  // Sort scores to compute rank (Orden de elegibilidad)
  const sortedScores = [...prelimRows]
    .filter((r) => r.puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje);

  const rows: EvaluatedEconomicRow[] = prelimRows.map((r) => {
    const rankIndex = sortedScores.findIndex((s) => s.proponentId === r.proponentId);
    const ordenElegibilidad = rankIndex >= 0 ? rankIndex + 1 : 0;
    return {
      ...r,
      ordenElegibilidad,
      ordenElegibilidadFormula: `=SI(F${r.rowNumber}=0;"N/A";JERARQUIA(F${r.rowNumber};$F$6:$F$${lastRow};0))`,
    };
  });

  return {
    officialBudget,
    averageEnabledOffers,
    averageFormula: `=PROMEDIO(${rangeStr})`,
    lowPriceThreshold,
    lowPriceThresholdFormula: `=B2*0,85`,
    minEnabledOffer,
    minOfferFormula: `=MIN(${rangeStr})`,
    rows,
    excludedProponents,
  };
}

export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}
