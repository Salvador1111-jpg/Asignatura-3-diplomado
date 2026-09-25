/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  INITIAL_PROPONENTS,
  EXTENDED_TEST_PROPONENT_E,
  INITIAL_GLOSSARY,
  ProponentData,
  GlossaryEntry,
  ProposedStatus,
} from './data/procurementCaseData';
import {
  evaluateFinancialSheet,
  summarizeProponentsEnabling,
  evaluateEconomicSheet,
} from './utils/spreadsheetEngine';
import {
  downloadStandaloneCommitteeHtml,
  downloadExcelFormulasCsv,
} from './utils/exporters';
import { CommitteeDashboardView } from './components/CommitteeDashboardView';
import { SpreadsheetWorkbookView } from './components/SpreadsheetWorkbookView';
import { DefinitiveDocumentView } from './components/DefinitiveDocumentView';
import { TdrAndProponentsView } from './components/TdrAndProponentsView';
import { WorkflowPromptsAndGovernanceView } from './components/WorkflowPromptsAndGovernanceView';

type ActiveSection =
  | 'tablero'
  | 'hoja'
  | 'documento'
  | 'expedientes'
  | 'metodologia';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('tablero');
  const [baseProponents, setBaseProponents] = useState<ProponentData[]>(() =>
    JSON.parse(JSON.stringify(INITIAL_PROPONENTS))
  );
  const [extendedProponentE, setExtendedProponentE] = useState<ProponentData>(() =>
    JSON.parse(JSON.stringify(EXTENDED_TEST_PROPONENT_E))
  );
  const [includeExtendedProponentE, setIncludeExtendedProponentE] =
    useState<boolean>(false);
  const [simulatePhase1, setSimulatePhase1] = useState<boolean>(false);
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(INITIAL_GLOSSARY);

  const activeProponents = useMemo(() => {
    return includeExtendedProponentE
      ? [...baseProponents, extendedProponentE]
      : baseProponents;
  }, [baseProponents, extendedProponentE, includeExtendedProponentE]);

  // 1. Hoja 2: Indicadores Financieros calculados con FÓRMULA
  const financialRows = useMemo(
    () => evaluateFinancialSheet(activeProponents),
    [activeProponents]
  );

  // 2. Consolidado de Habilitación por Componente
  const summaries = useMemo(
    () => summarizeProponentsEnabling(activeProponents, financialRows, true),
    [activeProponents, financialRows]
  );

  // 3. Hoja 3: Evaluación Económica (Solo ofertas habilitadas en Fase 2 vs todas en simulación Fase 1)
  const economicSheet = useMemo(
    () => evaluateEconomicSheet(activeProponents, summaries, simulatePhase1),
    [activeProponents, summaries, simulatePhase1]
  );

  // Comparativa permanente de qué pasaba en Fase 1 (cuando Proponente C entraba al promedio)
  const phase1EconomicComparison = useMemo(
    () => evaluateEconomicSheet(activeProponents, summaries, true),
    [activeProponents, summaries]
  );

  const updateProponentHelper = (
    proponentId: string,
    updater: (p: ProponentData) => ProponentData
  ) => {
    if (proponentId === 'PROP-E') {
      setExtendedProponentE((prev) => updater(prev));
    } else {
      setBaseProponents((prev) =>
        prev.map((p) => (p.id === proponentId ? updater(p) : p))
      );
    }
  };

  const handleUpdateObservation = (
    proponentId: string,
    requirementId: string,
    observation: string,
    decision?: 'PENDIENTE' | 'ACEPTADO' | 'SUBSANAR' | 'RECHAZADO'
  ) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      documentaryRows: p.documentaryRows.map((row) =>
        row.requirementId === requirementId
          ? {
              ...row,
              committeeObservation: observation,
              committeeRowDecision: decision || row.committeeRowDecision,
            }
          : row
      ),
    }));
  };

  const handleUpdateGlobalCommitteeDecision = (
    proponentId: string,
    decision: ProponentData['committeeGlobalDecision']
  ) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      committeeGlobalDecision: decision,
    }));
  };

  const handleApplyGeminiVerification = (
    proponentId: string,
    verifications: any[]
  ) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      documentaryRows: p.documentaryRows.map((row) => {
        const found = verifications.find(
          (v) =>
            v.requirementId === row.requirementId || v.numeral === row.numeral
        );
        if (!found) return row;
        const validStatus: ProposedStatus =
          found.proposedStatus === 'CUMPLE' ||
          found.proposedStatus === 'REQUIERE SUBSANACION' ||
          found.proposedStatus === 'NO CUMPLE'
            ? found.proposedStatus
            : row.proposedStatus;
        return {
          ...row,
          whatPresents: found.whatPresents || row.whatPresents,
          folio: found.folio || row.folio,
          proposedStatus: validStatus,
          findingNote: found.findingNote || row.findingNote,
        };
      }),
    }));
  };

  const handleUpdateFinancialInput = (
    proponentId: string,
    field:
      | 'activoCorriente'
      | 'pasivoCorriente'
      | 'activoTotal'
      | 'pasivoTotal'
      | 'cutoffDate',
    value: number | string
  ) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      financials: {
        ...p.financials,
        [field]: value,
      },
    }));
  };

  const handleUpdateOfferValue = (proponentId: string, newValue: number) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      economicOfferValue: newValue,
    }));
  };

  const handleUpdateFolioExcerpt = (
    proponentId: string,
    folioNumber: string,
    newExcerpt: string
  ) => {
    updateProponentHelper(proponentId, (p) => ({
      ...p,
      folios: p.folios.map((fl) =>
        fl.folioNumber === folioNumber ? { ...fl, excerpt: newExcerpt } : fl
      ),
    }));
  };

  const handleResetCaseData = () => {
    setBaseProponents(JSON.parse(JSON.stringify(INITIAL_PROPONENTS)));
    setExtendedProponentE(JSON.parse(JSON.stringify(EXTENDED_TEST_PROPONENT_E)));
    setSimulatePhase1(false);
  };

  const handleAddGlossarySynonym = (glossaryId: string, newSynonym: string) => {
    setGlossary((prev) =>
      prev.map((g) =>
        g.id === glossaryId
          ? { ...g, acceptedSynonyms: [...g.acceptedSynonyms, newSynonym] }
          : g
      )
    );
  };

  const handleExportStandaloneHtml = () => {
    downloadStandaloneCommitteeHtml(
      activeProponents,
      financialRows,
      summaries,
      economicSheet
    );
  };

  const handleExportCsvFormulas = () => {
    downloadExcelFormulasCsv(activeProponents, financialRows, economicSheet);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar Contract: 3 Zones (Single Brand Title — 5 Clean Nav Links — 2 Primary Actions) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#tablero"
          onClick={(e) => {
            e.preventDefault();
            setActiveSection('tablero');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          EVAL-OFERTA GenAI
        </a>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveSection('tablero')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeSection === 'tablero'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Tablero Comité
          </button>
          <button
            onClick={() => setActiveSection('hoja')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeSection === 'hoja'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Hoja Evaluación
          </button>
          <button
            onClick={() => setActiveSection('documento')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeSection === 'documento'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Documento Definitivo
          </button>
          <button
            onClick={() => setActiveSection('expedientes')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeSection === 'expedientes'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            TDR y Expedientes
          </button>
          <button
            onClick={() => setActiveSection('metodologia')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
              activeSection === 'metodologia'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Prompts y Gobernanza
          </button>
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsvFormulas}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Exportar Hoja
          </button>
          <button
            onClick={handleExportStandaloneHtml}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Exportar Tablero HTML
          </button>
        </div>
      </header>

      {/* Mobile Navigation Selector */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {(
          [
            ['tablero', 'Tablero Comité'],
            ['hoja', 'Hoja Evaluación'],
            ['documento', 'Documento Definitivo'],
            ['expedientes', 'TDR y Expedientes'],
            ['metodologia', 'Prompts y Gobernanza'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeSection === key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content Container (1440px baseline desktop container) */}
      <main className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'tablero' && (
          <CommitteeDashboardView
            proponents={activeProponents}
            financialRows={financialRows}
            summaries={summaries}
            economicSheet={economicSheet}
            phase1EconomicComparison={phase1EconomicComparison}
            simulatePhase1={simulatePhase1}
            setSimulatePhase1={setSimulatePhase1}
            includeExtendedProponentE={includeExtendedProponentE}
            setIncludeExtendedProponentE={setIncludeExtendedProponentE}
            glossary={glossary}
            onUpdateObservation={handleUpdateObservation}
            onUpdateGlobalCommitteeDecision={handleUpdateGlobalCommitteeDecision}
            onApplyGeminiVerification={handleApplyGeminiVerification}
            onExportStandaloneHtml={handleExportStandaloneHtml}
            onNavigateToSheet={() => setActiveSection('hoja')}
            onNavigateToReport={() => setActiveSection('documento')}
          />
        )}

        {activeSection === 'hoja' && (
          <SpreadsheetWorkbookView
            proponents={activeProponents}
            financialRows={financialRows}
            economicSheet={economicSheet}
            onUpdateFinancialInput={handleUpdateFinancialInput}
            onUpdateOfferValue={handleUpdateOfferValue}
            onResetCaseData={handleResetCaseData}
            onExportCsvFormulas={handleExportCsvFormulas}
          />
        )}

        {activeSection === 'documento' && (
          <DefinitiveDocumentView
            proponents={activeProponents}
            financialRows={financialRows}
            summaries={summaries}
            economicSheet={economicSheet}
          />
        )}

        {activeSection === 'expedientes' && (
          <TdrAndProponentsView
            proponents={activeProponents}
            onUpdateFolioExcerpt={handleUpdateFolioExcerpt}
          />
        )}

        {activeSection === 'metodologia' && (
          <WorkflowPromptsAndGovernanceView
            glossary={glossary}
            onAddGlossarySynonym={handleAddGlossarySynonym}
          />
        )}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-5 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong>EVAL-OFERTA GenAI — Fase II</strong> · Ampliación del flujo a la verificación
            de requisitos habilitantes: técnicos, financieros y de garantías · Autor: Jesús Salvador
            Ríos Rodríguez · Docente: Diego Fernando Zarate Pineda · Asturias Corporación
            Universitaria (2026)
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSection('metodologia')}
              className="hover:text-slate-900 underline"
            >
              Ver Bitácora de Pruebas y Riesgos Éticos
            </button>
            <button
              onClick={handleResetCaseData}
              className="hover:text-slate-900 underline"
            >
              Restaurar Caso Base
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
