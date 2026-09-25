export type ComponentType = 'Técnico' | 'Financiero' | 'Garantías';

export type VerificationNature = 'Documental (Modelo + Folio)' | 'Cálculo (Hoja con Fórmula)';

export type ProposedStatus = 'CUMPLE' | 'REQUIERE SUBSANACION' | 'NO CUMPLE';

export type CommitteeDecisionStatus =
  | 'PENDIENTE DEL COMITÉ'
  | 'HABILITADO POR COMITÉ'
  | 'EN SUBSANACIÓN'
  | 'RECHAZADO / NO HABILITADO';

export interface RequirementItem {
  id: string;
  numeral: string;
  component: ComponentType;
  title: string;
  description: string;
  howVerified: string;
  verificationNature: VerificationNature;
  excelFormulaRule?: string;
}

export interface ProponentFolio {
  folioNumber: string;
  documentTitle: string;
  issueDate: string;
  excerpt: string;
}

export interface DocumentaryVerificationRow {
  requirementId: string;
  numeral: string;
  component: ComponentType;
  requirementTitle: string;
  whatPresents: string;
  folio: string;
  proposedStatus: ProposedStatus;
  findingNote: string;
  committeeObservation: string;
  committeeRowDecision: 'PENDIENTE' | 'ACEPTADO' | 'SUBSANAR' | 'RECHAZADO';
}

export interface FinancialData {
  cutoffDate: string; // Mejora Tabla 6: Columna de fecha de corte en los estados financieros
  requiredCutoffYear: number;
  activoCorriente: number; // COP
  pasivoCorriente: number; // COP
  activoTotal: number; // COP
  pasivoTotal: number; // COP
  folio: string;
}

export interface ProponentData {
  id: string;
  code: string;
  name: string;
  nit: string;
  offeredConfiguration: string;
  economicOfferValue: number; // COP con IVA
  economicOfferFolio: string;
  isExtendedTestCase?: boolean; // Proponente E (Tabla 6: ausencia total de documento)
  financials: FinancialData;
  documentaryRows: DocumentaryVerificationRow[];
  folios: ProponentFolio[];
  committeeGlobalDecision: CommitteeDecisionStatus;
  committeeGlobalNote: string;
}

export interface GlossaryEntry {
  id: string;
  canonicalTerm: string;
  tdrNumeral: string;
  acceptedSynonyms: string[];
  rejectedTerms: string[];
}

export interface PromptRecord {
  id: string;
  stepNumber: number;
  title: string;
  toolUsed: 'ChatGPT (versión Plus)' | 'Gemini';
  purpose: string;
  promptText: string;
  outputFormat: string;
  shareUrl: string;
}

export interface BitacoraAdjustment {
  id: string;
  promptCode: string;
  whatFailed: string;
  whatChanged: string;
  result: string;
}

export interface RiskItem {
  id: string;
  risk: string;
  mitigation: string;
  implementedInApp: string;
}

export interface ImprovementItem {
  id: string;
  improvement: string;
  whatItFixes: string;
  priority: 'Alta' | 'Media' | 'Baja';
  statusInApp: string;
}

export const PROCESS_PARAMETERS = {
  processCode: 'LP-TIC-014-2026',
  entityName: 'Entidad Pública Colombiana — Dirección de Tecnología e Información',
  modality: 'Licitación Pública — Selección Objetiva',
  object:
    'Adquisición de una infraestructura de hiperconvergencia (nodos, licenciamiento, soporte a 3 años e instalación)',
  officialBudget: 2400000000, // $2.400.000.000 IVA incluido
  executionTermMonths: 36, // 3 años
  closingDate: '2026-09-18 16:00 COT',
  minExperienceContractRatio: 0.5, // 50% del presupuesto oficial = $1.200.000.000
  minExperienceCount: 2,
  minLiquidityIndex: 2.0, // Activo Corriente / Pasivo Corriente >= 2,0
  maxIndebtednessIndex: 0.6, // Pasivo Total / Activo Total <= 60%
  requiredFinancialCutoffYear: 2025,
  complianceGuaranteePct: 20,
  complianceGuaranteeExtraMonths: 6, // Plazo (36m) + 6 meses = 42 meses
  qualityGuaranteePct: 20,
  qualityGuaranteeExtraMonths: 12, // Plazo (36m) + 1 año = 48 meses
  lowPriceThresholdRatio: 0.85, // 85% del promedio de las ofertas habilitadas
};

export const TDR_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'REQ-T1',
    numeral: '4.1',
    component: 'Técnico',
    title: 'Experiencia específica en infraestructura hiperconvergente',
    description:
      'Dos contratos de infraestructura hiperconvergente ejecutados en los últimos cinco años, cada uno por al menos el 50 % del presupuesto oficial ($1.200.000.000 COP).',
    howVerified: 'Documental: certificaciones de experiencia con objeto, valor y fecha',
    verificationNature: 'Documental (Modelo + Folio)',
  },
  {
    id: 'REQ-T2',
    numeral: '4.2',
    component: 'Técnico',
    title: 'Certificación vigente del fabricante como aliado autorizado',
    description:
      'Certificación vigente del fabricante como aliado de la solución ofrecida (Partner Autorizado / Gold / Platinum).',
    howVerified: 'Documental: certificado del fabricante con fecha de vigencia',
    verificationNature: 'Documental (Modelo + Folio)',
  },
  {
    id: 'REQ-T3',
    numeral: '4.3',
    component: 'Técnico',
    title: 'Personal mínimo: Ingeniero certificado en la plataforma',
    description:
      'Un ingeniero certificado en la plataforma ofertada con dedicación al despliegue y puesta en operación.',
    howVerified: 'Documental: hoja de vida y certificado técnico vigente',
    verificationNature: 'Documental (Modelo + Folio)',
  },
  {
    id: 'REQ-F1',
    numeral: '5.1',
    component: 'Financiero',
    title: 'Índice de liquidez igual o superior a 2,0',
    description:
      'Capacidad de respaldar obligaciones de corto plazo: cociente entre Activo Corriente y Pasivo Corriente >= 2,0.',
    howVerified: 'Cálculo: activo corriente sobre pasivo corriente (en Hoja de Cálculo)',
    verificationNature: 'Cálculo (Hoja con Fórmula)',
    excelFormulaRule: '=SI(B{row}/C{row}>=2,0;"CUMPLE";"NO CUMPLE")',
  },
  {
    id: 'REQ-F2',
    numeral: '5.2',
    component: 'Financiero',
    title: 'Índice de endeudamiento igual o inferior al 60 %',
    description:
      'Nivel de apalancamiento financiero: cociente entre Pasivo Total y Activo Total <= 60 %.',
    howVerified: 'Cálculo: pasivo total sobre activo total (en Hoja de Cálculo)',
    verificationNature: 'Cálculo (Hoja con Fórmula)',
    excelFormulaRule: '=SI(E{row}/D{row}<=0,60;"CUMPLE";"NO CUMPLE")',
  },
  {
    id: 'REQ-G1',
    numeral: '6.1',
    component: 'Garantías',
    title: 'Garantía de cumplimiento del contrato',
    description:
      'Cumplimiento por el 20 % del valor, vigente por el plazo del contrato (36 meses) y seis (6) meses más (42 meses en total).',
    howVerified: 'Documental: póliza con amparo, porcentaje y vigencia',
    verificationNature: 'Documental (Modelo + Folio)',
  },
  {
    id: 'REQ-G2',
    numeral: '6.2',
    component: 'Garantías',
    title: 'Garantía de calidad del servicio',
    description:
      'Calidad del servicio por el 20 % del valor, vigente por el plazo del contrato (36 meses) y un (1) año más (48 meses en total).',
    howVerified: 'Documental: póliza con amparo, porcentaje y vigencia',
    verificationNature: 'Documental (Modelo + Folio)',
  },
];

export const INITIAL_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'GLOS-1',
    canonicalTerm: 'Infraestructura Hiperconvergente (HCI)',
    tdrNumeral: '4.1',
    acceptedSynonyms: [
      'infraestructura hiperconvergente',
      'nodos de hiperconvergencia',
      'clúster hiperconvergente de cómputo y almacenamiento definido por software',
      'plataforma HCI virtualizada (vSAN / Nutanix / HiperCore)',
      'solución convergente definida por software (SDDC)',
    ],
    rejectedTerms: [
      'suministro de computadores de escritorio',
      'cableado estructurado',
      'arrendamiento de impresoras',
      'licenciamiento ofimático estándar',
    ],
  },
  {
    id: 'GLOS-2',
    canonicalTerm: 'Certificación de Aliado del Fabricante (Partner)',
    tdrNumeral: '4.2',
    acceptedSynonyms: [
      'aliado autorizado de la solución',
      'certificado de canal autorizado Gold / Platinum',
      'Manufacturer Authorized Partner Certificate',
      'distribuidor e integrador certificado por casa matriz',
    ],
    rejectedTerms: [
      'carta de intención comercial sin aval del fabricante',
      'registro mercantil cámara de comercio',
    ],
  },
];

export const INITIAL_PROPONENTS: ProponentData[] = [
  {
    id: 'PROP-A',
    code: 'Proponente A',
    name: 'Proponente A — Infra Andes SAS',
    nit: '900.412.881-3',
    offeredConfiguration:
      'Fabricante HiperCore Technologies Inc. — Clúster 6 Nodos HCI NVMe + Licenciamiento Enterprise + Soporte 36 meses 24x7',
    economicOfferValue: 2350000000,
    economicOfferFolio: 'Folio 9',
    financials: {
      cutoffDate: '2025-12-31',
      requiredCutoffYear: 2025,
      activoCorriente: 2800000000,
      pasivoCorriente: 1000000000,
      activoTotal: 5000000000,
      pasivoTotal: 2100000000,
      folio: 'Folio 6',
    },
    committeeGlobalDecision: 'HABILITADO POR COMITÉ',
    committeeGlobalNote:
      'Verificados los 7 requisitos habilitantes contra los folios 2 a 8 y los cocientes financieros en la hoja. Cumple integralmente.',
    documentaryRows: [
      {
        requirementId: 'REQ-T1',
        numeral: '4.1',
        component: 'Técnico',
        requirementTitle: 'Dos contratos HCI (últimos 5 años, >= 50% PO)',
        whatPresents:
          '2 certificaciones de contratos ejecutados: Contrato 2023 ($1.450.000.000) y Contrato 2024 ($1.320.000.000) en clúster hiperconvergente.',
        folio: 'Folios 2-3',
        proposedStatus: 'CUMPLE',
        findingNote:
          'Ambos contratos superan el 50 % del presupuesto oficial ($1.200.000.000) y fueron ejecutados dentro de la ventana de 5 años.',
        committeeObservation: 'Verificado en expediente físico y digital.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T2',
        numeral: '4.2',
        component: 'Técnico',
        requirementTitle: 'Certificación vigente del fabricante',
        whatPresents:
          'Certificado del fabricante HiperCore Technologies Inc. como Aliado Platinum autorizado, vigente hasta 31/12/2027.',
        folio: 'Folio 4',
        proposedStatus: 'CUMPLE',
        findingNote: 'Certificación expedida por casa matriz con fecha de vigencia activa al cierre del proceso.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T3',
        numeral: '4.3',
        component: 'Técnico',
        requirementTitle: 'Un ingeniero certificado en la plataforma ofertada',
        whatPresents:
          'Aporta Hoja de Vida del Ingeniero Líder (Ing. Carlos M. Ruiz) y Certificado HiperCore Certified Architect vigente.',
        folio: 'Folio 5',
        proposedStatus: 'CUMPLE',
        findingNote: 'Se adjunta tanto la hoja de vida como la acreditación oficial vigente en la plataforma ofertada.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G1',
        numeral: '6.1',
        component: 'Garantías',
        requirementTitle: 'Garantía de cumplimiento (20%, plazo + 6 meses)',
        whatPresents:
          'Póliza Seguros del Estado No. 88410-1: Amparo de cumplimiento por el 20 % del valor, vigencia 42 meses (plazo 36m + 6 meses más).',
        folio: 'Folio 7',
        proposedStatus: 'CUMPLE',
        findingNote: 'Cubre el porcentaje (20 %) y la vigencia total exigida (36 meses + 6 meses adicionales).',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G2',
        numeral: '6.2',
        component: 'Garantías',
        requirementTitle: 'Garantía de calidad del servicio (20%, plazo + 1 año)',
        whatPresents:
          'Póliza Seguros del Estado No. 88410-2: Amparo de calidad del servicio por el 20 % del valor, vigencia 48 meses (plazo 36m + 12 meses más).',
        folio: 'Folio 8',
        proposedStatus: 'CUMPLE',
        findingNote: 'Cubre el porcentaje (20 %) y la vigencia total exigida (36 meses + 1 año adicional).',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
    ],
    folios: [
      {
        folioNumber: 'Folios 2-3',
        documentTitle: 'Certificaciones de Experiencia Específica HCI',
        issueDate: '2026-08-15',
        excerpt:
          'FOLIO 2: Certificación expedida por Gobernación de Cundinamarca — Contrato 419-2023. Objeto: "Suministro, instalación y puesta en marcha de infraestructura hiperconvergente de 6 nodos". Valor ejecutado: $1.450.000.000 COP. Fecha terminación: Noviembre 2023.\nFOLIO 3: Certificación expedida por EPM Telecomunicaciones — Contrato 108-2024. Objeto: "Adquisición de plataforma de hiperconvergencia y soporte a 3 años". Valor ejecutado: $1.320.000.000 COP. Fecha terminación: Octubre 2024.',
      },
      {
        folioNumber: 'Folio 4',
        documentTitle: 'Certificado de Fabricante HiperCore Technologies Inc.',
        issueDate: '2026-02-10',
        excerpt:
          'FOLIO 4: HiperCore Technologies Inc. certifica que INFRA ANDES SAS (NIT 900.412.881-3) ostenta la calidad de ALIADO PLATINUM AUTORIZADO para distribuir, instalar y prestar soporte de garantía de fábrica en Colombia. Vigencia del certificado: Desde 01/01/2026 hasta 31/12/2027.',
      },
      {
        folioNumber: 'Folio 5',
        documentTitle: 'Hoja de Vida y Certificación Ingeniero Residente',
        issueDate: '2026-09-01',
        excerpt:
          'FOLIO 5: Hoja de vida de Carlos Mario Ruiz Gómez (Matrícula Profesional CN205-99412). Adjunta credencial oficial HiperCore Certified Systems Architect (ID #HCSA-2025-8821) con vencimiento en junio de 2028.',
      },
      {
        folioNumber: 'Folio 6',
        documentTitle: 'Estados Financieros Dictaminados a 31 de Diciembre de 2025',
        issueDate: '2026-03-20',
        excerpt:
          'FOLIO 6: Balance General Auditado (Corte 31/12/2025). Activo Corriente: $2.800.000.000. Pasivo Corriente: $1.000.000.000. Activo Total: $5.000.000.000. Pasivo Total: $2.100.000.000. Firmado por Representante Legal y Revisor Fiscal T.P. 114209-T.',
      },
      {
        folioNumber: 'Folio 7',
        documentTitle: 'Anexo de Garantía de Cumplimiento del Contrato',
        issueDate: '2026-09-14',
        excerpt:
          'FOLIO 7: Póliza de Cumplimiento ante Entidades Estatales No. 88410-1. Amparo: Cumplimiento del contrato. Cuantía asegurada: 20 % del valor total del contrato. Vigencia: Por el plazo de ejecución del contrato (36 meses) y seis (6) meses más (42 meses totales).',
      },
      {
        folioNumber: 'Folio 8',
        documentTitle: 'Anexo de Garantía de Calidad del Servicio',
        issueDate: '2026-09-14',
        excerpt:
          'FOLIO 8: Póliza de Cumplimiento ante Entidades Estatales No. 88410-2. Amparo: Calidad del servicio y correcto funcionamiento de equipos. Cuantía asegurada: 20 % del valor total del contrato. Vigencia: Por el plazo de ejecución (36 meses) y un (1) año más (48 meses totales).',
      },
      {
        folioNumber: 'Folio 9',
        documentTitle: 'Formulario No. 4 — Oferta Económica Total',
        issueDate: '2026-09-17',
        excerpt:
          'FOLIO 9: Propuesta Económica INFRA ANDES SAS. Valor total ofertado por la solución integral (6 nodos HCI, licenciamiento perpetuo, soporte 3 años e instalación), incluido IVA del 19 %: $2.350.000.000 COP.',
      },
    ],
  },
  {
    id: 'PROP-B',
    code: 'Proponente B',
    name: 'Proponente B — DataCore Colombia SAS',
    nit: '830.119.504-7',
    offeredConfiguration:
      'Fabricante HiperCore Technologies Inc. — Clúster 6 Nodos HCI Hybrid-Flash + Licenciamiento + Soporte 36 meses',
    economicOfferValue: 2290000000,
    economicOfferFolio: 'Folio 9',
    financials: {
      cutoffDate: '2025-12-31',
      requiredCutoffYear: 2025,
      activoCorriente: 3100000000,
      pasivoCorriente: 1000000000,
      activoTotal: 5000000000,
      pasivoTotal: 1900000000,
      folio: 'Folio 6',
    },
    committeeGlobalDecision: 'EN SUBSANACIÓN',
    committeeGlobalNote:
      'El asistente detectó en el Folio 4 que el certificado del fabricante venció el 15/01/2026. El Comité solicita subsanación jurídica para acreditar vigencia anterior al cierre.',
    documentaryRows: [
      {
        requirementId: 'REQ-T1',
        numeral: '4.1',
        component: 'Técnico',
        requirementTitle: 'Dos contratos HCI (últimos 5 años, >= 50% PO)',
        whatPresents:
          '2 certificaciones de contratos ejecutados: Contrato 2022 ($1.600.000.000) y Contrato 2024 ($1.280.000.000) en infraestructura hiperconvergente.',
        folio: 'Folios 2-3',
        proposedStatus: 'CUMPLE',
        findingNote:
          'Ambas certificaciones acreditan objeto HCI, ejecución en los últimos 5 años y cuantía superior a $1.200.000.000.',
        committeeObservation: 'Cumple requisito técnico de experiencia.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T2',
        numeral: '4.2',
        component: 'Técnico',
        requirementTitle: 'Certificación vigente del fabricante',
        whatPresents:
          'Certificado del fabricante HiperCore Technologies Inc. con fecha de vencimiento 15 de enero de 2026 (VENCIDO al cierre).',
        folio: 'Folio 4',
        proposedStatus: 'REQUIERE SUBSANACION',
        findingNote:
          'El documento aportado en el Folio 4 registra vigencia vencida (15/01/2026). Se reporta hallazgo objetivo al comité para calificación de subsanabilidad.',
        committeeObservation: 'Se formula requerimiento de subsanación dentro del término de traslado.',
        committeeRowDecision: 'SUBSANAR',
      },
      {
        requirementId: 'REQ-T3',
        numeral: '4.3',
        component: 'Técnico',
        requirementTitle: 'Un ingeniero certificado en la plataforma ofertada',
        whatPresents:
          'Aporta Hoja de Vida de la Ingeniera Líder (Ing. Diana P. Valencia) y certificado vigente en la plataforma ofertada.',
        folio: 'Folio 5',
        proposedStatus: 'CUMPLE',
        findingNote: 'Hoja de vida y certificación técnica vigentes verificadas en Folio 5.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G1',
        numeral: '6.1',
        component: 'Garantías',
        requirementTitle: 'Garantía de cumplimiento (20%, plazo + 6 meses)',
        whatPresents:
          'Póliza Suramericana No. 44190-A: Amparo de cumplimiento por el 20 % del valor, vigencia por el plazo (36m) y 6 meses más.',
        folio: 'Folio 7',
        proposedStatus: 'CUMPLE',
        findingNote: 'Acredita amparo del 20 % y vigencia total de 42 meses conforme al numeral 6.1.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G2',
        numeral: '6.2',
        component: 'Garantías',
        requirementTitle: 'Garantía de calidad del servicio (20%, plazo + 1 año)',
        whatPresents:
          'Póliza Suramericana No. 44190-B: Amparo de calidad del servicio por el 20 % del valor, vigencia por el plazo (36m) y 1 año más.',
        folio: 'Folio 8',
        proposedStatus: 'CUMPLE',
        findingNote: 'Acredita amparo del 20 % y vigencia total de 48 meses conforme al numeral 6.2.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
    ],
    folios: [
      {
        folioNumber: 'Folios 2-3',
        documentTitle: 'Certificaciones de Experiencia Específica HCI',
        issueDate: '2026-08-20',
        excerpt:
          'FOLIO 2: Ministerio del Interior — Contrato 802-2022. Objeto: "Implementación de clúster hiperconvergente de cómputo y almacenamiento". Valor: $1.600.000.000 COP. Terminación: Diciembre 2022.\nFOLIO 3: Alcaldía Mayor — Contrato 315-2024. Objeto: "Renovación tecnológica en nodos de hiperconvergencia". Valor: $1.280.000.000 COP. Terminación: Agosto 2024.',
      },
      {
        folioNumber: 'Folio 4',
        documentTitle: 'Certificado de Fabricante HiperCore Technologies Inc. (VENCIDO)',
        issueDate: '2025-01-15',
        excerpt:
          'FOLIO 4: HiperCore Technologies Inc. hace constar que DATACORE COLOMBIA SAS es distribuidor autorizado para la línea HiperCore Enterprise. Fecha de expedición: 15 de enero de 2025. Fecha de expiración / vigencia: 15 de enero de 2026. [NOTA DEL DOCUMENTO: No se adjunta renovación para el periodo 2026-2027].',
      },
      {
        folioNumber: 'Folio 5',
        documentTitle: 'Hoja de Vida y Certificación Ingeniera Líder',
        issueDate: '2026-09-03',
        excerpt:
          'FOLIO 5: Hoja de vida de Diana Patricia Valencia (Ing. de Sistemas). Adjunta certificado oficial HiperCore Deployment Specialist vigente hasta noviembre de 2027.',
      },
      {
        folioNumber: 'Folio 6',
        documentTitle: 'Estados Financieros a 31 de Diciembre de 2025',
        issueDate: '2026-03-18',
        excerpt:
          'FOLIO 6: Estados Financieros Certificados (Corte 31/12/2025). Activo Corriente: $3.100.000.000. Pasivo Corriente: $1.000.000.000. Activo Total: $5.000.000.000. Pasivo Total: $1.900.000.000.',
      },
      {
        folioNumber: 'Folio 7',
        documentTitle: 'Garantía de Cumplimiento',
        issueDate: '2026-09-15',
        excerpt:
          'FOLIO 7: Póliza Seguros Generales Suramericana No. 44190-A. Amparo: Cumplimiento del contrato por el 20 % del valor, vigente por el plazo de ejecución (36 meses) y seis (6) meses más (42 meses).',
      },
      {
        folioNumber: 'Folio 8',
        documentTitle: 'Garantía de Calidad del Servicio',
        issueDate: '2026-09-15',
        excerpt:
          'FOLIO 8: Póliza Seguros Generales Suramericana No. 44190-B. Amparo: Calidad del servicio por el 20 % del valor, vigente por el plazo de ejecución (36 meses) y un (1) año más (48 meses).',
      },
      {
        folioNumber: 'Folio 9',
        documentTitle: 'Formulario de Oferta Económica',
        issueDate: '2026-09-17',
        excerpt:
          'FOLIO 9: Oferta Económica DATACORE COLOMBIA SAS. Valor total ofertado con IVA incluido: $2.290.000.000 COP.',
      },
    ],
  },
  {
    id: 'PROP-C',
    code: 'Proponente C',
    name: 'Proponente C — TechNova SAS',
    nit: '901.008.312-9',
    offeredConfiguration:
      'Fabricante HiperCore Technologies Inc. — Clúster 6 Nodos HCI + Licenciamiento Base + Soporte 36 meses',
    economicOfferValue: 1780000000, // La oferta más baja del caso, que queda excluida por no alcanzar los indicadores financieros
    economicOfferFolio: 'Folio 9',
    financials: {
      cutoffDate: '2025-12-31',
      requiredCutoffYear: 2025,
      activoCorriente: 1400000000,
      pasivoCorriente: 1000000000,
      activoTotal: 5000000000,
      pasivoTotal: 3550000000,
      folio: 'Folio 6',
    },
    committeeGlobalDecision: 'RECHAZADO / NO HABILITADO',
    committeeGlobalNote:
      'No alcanza los indicadores financieros calculados en la hoja: Liquidez 1,40 (mínimo 2,0) y Endeudamiento 71,0% (máximo 60%). Al no superar la habilitación, su oferta económica ($1.780.000.000) no pasa a evaluación económica.',
    documentaryRows: [
      {
        requirementId: 'REQ-T1',
        numeral: '4.1',
        component: 'Técnico',
        requirementTitle: 'Dos contratos HCI (últimos 5 años, >= 50% PO)',
        whatPresents:
          '2 certificaciones de contratos ejecutados: Contrato 2023 ($1.250.000.000) y Contrato 2025 ($1.310.000.000) en infraestructura hiperconvergente.',
        folio: 'Folios 2-3',
        proposedStatus: 'CUMPLE',
        findingNote:
          'Ambos contratos cumplen objeto, vigencia dentro de los últimos 5 años y valor individual >= $1.200.000.000.',
        committeeObservation: 'Cumple componente técnico.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T2',
        numeral: '4.2',
        component: 'Técnico',
        requirementTitle: 'Certificación vigente del fabricante',
        whatPresents:
          'Certificado del fabricante HiperCore Technologies Inc. autorizado y vigente hasta 30/06/2027.',
        folio: 'Folio 4',
        proposedStatus: 'CUMPLE',
        findingNote: 'Certificación de fabricante vigente verificada en Folio 4.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T3',
        numeral: '4.3',
        component: 'Técnico',
        requirementTitle: 'Un ingeniero certificado en la plataforma ofertada',
        whatPresents:
          'Aporta Hoja de Vida del Ingeniero Líder (Ing. Andrés F. Mora) y certificación vigente en la plataforma.',
        folio: 'Folio 5',
        proposedStatus: 'CUMPLE',
        findingNote: 'Cumple acreditación documental de hoja de vida y certificación en Folio 5.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G1',
        numeral: '6.1',
        component: 'Garantías',
        requirementTitle: 'Garantía de cumplimiento (20%, plazo + 6 meses)',
        whatPresents:
          'Póliza Mundial de Seguros No. 77301-1: Amparo de cumplimiento por el 20 % del valor, vigencia por el plazo (36m) y 6 meses más.',
        folio: 'Folio 7',
        proposedStatus: 'CUMPLE',
        findingNote: 'Cumple amparo, porcentaje y vigencia de 42 meses.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G2',
        numeral: '6.2',
        component: 'Garantías',
        requirementTitle: 'Garantía de calidad del servicio (20%, plazo + 1 año)',
        whatPresents:
          'Póliza Mundial de Seguros No. 77301-2: Amparo de calidad del servicio por el 20 % del valor, vigencia por el plazo (36m) y 1 año más.',
        folio: 'Folio 8',
        proposedStatus: 'CUMPLE',
        findingNote: 'Cumple amparo, porcentaje y vigencia de 48 meses.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
    ],
    folios: [
      {
        folioNumber: 'Folios 2-3',
        documentTitle: 'Certificaciones de Experiencia Específica HCI',
        issueDate: '2026-08-19',
        excerpt:
          'FOLIO 2: Instituto Nacional de Salud — Contrato 512-2023. Objeto: "Adquisición de infraestructura hiperconvergente para centro de datos". Valor: $1.250.000.000 COP.\nFOLIO 3: Agencia Nacional Digital — Contrato 094-2025. Objeto: "Nodos de hiperconvergencia y licenciamiento". Valor: $1.310.000.000 COP.',
      },
      {
        folioNumber: 'Folio 4',
        documentTitle: 'Certificado de Fabricante HiperCore Technologies Inc.',
        issueDate: '2026-01-20',
        excerpt:
          'FOLIO 4: HiperCore Technologies Inc. certifica que TECHNOVA SAS es aliado Gold autorizado en Colombia con vigencia hasta el 30 de junio de 2027.',
      },
      {
        folioNumber: 'Folio 5',
        documentTitle: 'Hoja de Vida y Certificado del Ingeniero Propuesto',
        issueDate: '2026-09-02',
        excerpt:
          'FOLIO 5: Hoja de vida del Ing. Andrés Felipe Mora y certificado oficial HiperCore Certified Engineer vigente hasta 2028.',
      },
      {
        folioNumber: 'Folio 6',
        documentTitle: 'Estados Financieros a 31 de Diciembre de 2025 (Incumplimiento de Índices)',
        issueDate: '2026-03-25',
        excerpt:
          'FOLIO 6: Balance General a 31/12/2025. Activo Corriente: $1.400.000.000. Pasivo Corriente: $1.000.000.000 (Liquidez resultante en hoja = 1,40 < 2,0 exigido). Activo Total: $5.000.000.000. Pasivo Total: $3.550.000.000 (Endeudamiento resultante en hoja = 71,0 % > 60 % máximo exigido).',
      },
      {
        folioNumber: 'Folio 7',
        documentTitle: 'Garantía de Cumplimiento',
        issueDate: '2026-09-14',
        excerpt:
          'FOLIO 7: Póliza Mundial No. 77301-1. Amparo de cumplimiento por el 20 % del valor del contrato, vigencia por el plazo (36 meses) y 6 meses más (42 meses).',
      },
      {
        folioNumber: 'Folio 8',
        documentTitle: 'Garantía de Calidad del Servicio',
        issueDate: '2026-09-14',
        excerpt:
          'FOLIO 8: Póliza Mundial No. 77301-2. Amparo de calidad del servicio por el 20 % del valor, vigencia por el plazo (36 meses) y 1 año más (48 meses).',
      },
      {
        folioNumber: 'Folio 9',
        documentTitle: 'Formulario de Oferta Económica (Oferta más baja del proceso)',
        issueDate: '2026-09-17',
        excerpt:
          'FOLIO 9: Oferta Económica TECHNOVA SAS. Valor total ofertado con IVA incluido: $1.780.000.000 COP. [Nota del caso: En la Fase 1 esta oferta llegaba a la evaluación económica y activaba el filtro de precio artificialmente bajo; en la Fase 2 queda excluida en habilitación financiera].',
      },
    ],
  },
  {
    id: 'PROP-D',
    code: 'Proponente D',
    name: 'Proponente D — CloudSys SAS',
    nit: '860.531.902-1',
    offeredConfiguration:
      'Fabricante HiperCore Technologies Inc. — Clúster 6 Nodos HCI All-Flash + Licenciamiento + Soporte 36 meses',
    economicOfferValue: 2210000000,
    economicOfferFolio: 'Folio 9',
    financials: {
      cutoffDate: '2025-12-31',
      requiredCutoffYear: 2025,
      activoCorriente: 2200000000,
      pasivoCorriente: 1000000000,
      activoTotal: 5000000000,
      pasivoTotal: 2750000000,
      folio: 'Folio 6',
    },
    committeeGlobalDecision: 'HABILITADO POR COMITÉ',
    committeeGlobalNote:
      'El asistente reportó en el Folio 7 que la garantía de cumplimiento cubría solo 3 meses adicionales en lugar de 6 meses. El proponente aportó anexo modificatorio de póliza en término de subsanación y el Comité lo declara HABILITADO.',
    documentaryRows: [
      {
        requirementId: 'REQ-T1',
        numeral: '4.1',
        component: 'Técnico',
        requirementTitle: 'Dos contratos HCI (últimos 5 años, >= 50% PO)',
        whatPresents:
          '2 certificaciones de contratos ejecutados: Contrato 2022 ($1.380.000.000) y Contrato 2024 ($1.510.000.000) en plataforma HCI.',
        folio: 'Folios 2-3',
        proposedStatus: 'CUMPLE',
        findingNote:
          'Ambos contratos superan el 50 % del presupuesto oficial ($1.200.000.000) y están dentro de los últimos 5 años.',
        committeeObservation: 'Cumple.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T2',
        numeral: '4.2',
        component: 'Técnico',
        requirementTitle: 'Certificación vigente del fabricante',
        whatPresents:
          'Certificado del fabricante HiperCore Technologies Inc. autorizado, vigente hasta 15/11/2027.',
        folio: 'Folio 4',
        proposedStatus: 'CUMPLE',
        findingNote: 'Certificación vigente verificada en Folio 4.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-T3',
        numeral: '4.3',
        component: 'Técnico',
        requirementTitle: 'Un ingeniero certificado en la plataforma ofertada',
        whatPresents:
          'Aporta Hoja de Vida del Ingeniero Líder (Ing. Jorge E. Pineda) y certificación oficial vigente.',
        folio: 'Folio 5',
        proposedStatus: 'CUMPLE',
        findingNote: 'Hoja de vida y certificación vigentes verificadas en Folio 5.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G1',
        numeral: '6.1',
        component: 'Garantías',
        requirementTitle: 'Garantía de cumplimiento (20%, plazo + 6 meses)',
        whatPresents:
          'Póliza Bolívar No. 99204-1 por el 20 % del valor, pero con vigencia por el plazo del contrato y SOLO TRES (3) MESES MÁS (39 meses vs 42 exigidos).',
        folio: 'Folio 7',
        proposedStatus: 'REQUIERE SUBSANACION',
        findingNote:
          'El numeral 6.1 exige vigencia por el plazo (36m) y 6 meses más (42m). La póliza en Folio 7 solo cubre 3 meses adicionales.',
        committeeObservation:
          'Defecto en garantía subsanable conforme a ley de contratación pública; allegó anexo de ampliación a 42 meses.',
        committeeRowDecision: 'ACEPTADO',
      },
      {
        requirementId: 'REQ-G2',
        numeral: '6.2',
        component: 'Garantías',
        requirementTitle: 'Garantía de calidad del servicio (20%, plazo + 1 año)',
        whatPresents:
          'Póliza Bolívar No. 99204-2: Amparo de calidad del servicio por el 20 % del valor, vigencia por el plazo (36m) y 1 año más (48 meses).',
        folio: 'Folio 8',
        proposedStatus: 'CUMPLE',
        findingNote: 'Acredita amparo del 20 % y vigencia total de 48 meses conforme al numeral 6.2.',
        committeeObservation: 'Conforme.',
        committeeRowDecision: 'ACEPTADO',
      },
    ],
    folios: [
      {
        folioNumber: 'Folios 2-3',
        documentTitle: 'Certificaciones de Experiencia Específica HCI',
        issueDate: '2026-08-22',
        excerpt:
          'FOLIO 2: Banco Agrario de Colombia — Contrato 611-2022. Objeto: "Suministro e instalación de clúster de hiperconvergencia". Valor: $1.380.000.000 COP.\nFOLIO 3: Registraduría Nacional — Contrato 209-2024. Objeto: "Ampliación de nodos de infraestructura hiperconvergente". Valor: $1.510.000.000 COP.',
      },
      {
        folioNumber: 'Folio 4',
        documentTitle: 'Certificado de Fabricante HiperCore Technologies Inc.',
        issueDate: '2026-02-01',
        excerpt:
          'FOLIO 4: HiperCore Technologies Inc. certifica que CLOUDSYS SAS es Aliado Gold Autorizado en Colombia hasta el 15 de noviembre de 2027.',
      },
      {
        folioNumber: 'Folio 5',
        documentTitle: 'Hoja de Vida y Certificado del Ingeniero Propuesto',
        issueDate: '2026-09-04',
        excerpt:
          'FOLIO 5: Hoja de vida del Ing. Jorge Enrique Pineda y certificación HiperCore Senior Architect vigente hasta 2027.',
      },
      {
        folioNumber: 'Folio 6',
        documentTitle: 'Estados Financieros a 31 de Diciembre de 2025',
        issueDate: '2026-03-22',
        excerpt:
          'FOLIO 6: Balance General Auditado a 31/12/2025. Activo Corriente: $2.200.000.000. Pasivo Corriente: $1.000.000.000 (Liquidez = 2,20). Activo Total: $5.000.000.000. Pasivo Total: $2.750.000.000 (Endeudamiento = 55,0 %).',
      },
      {
        folioNumber: 'Folio 7',
        documentTitle: 'Garantía de Cumplimiento (Vigencia incompleta: +3 meses)',
        issueDate: '2026-09-15',
        excerpt:
          'FOLIO 7: Compañía de Seguros Bolívar S.A. Póliza No. 99204-1. Amparo: Cumplimiento del contrato. Valor asegurado: 20 % del valor del contrato. Vigencia otorgada: 39 meses (correspondientes a 36 meses de plazo de ejecución más 3 meses adicionales). [Exigido en TDR Numeral 6.1: plazo + 6 meses = 42 meses].',
      },
      {
        folioNumber: 'Folio 8',
        documentTitle: 'Garantía de Calidad del Servicio',
        issueDate: '2026-09-15',
        excerpt:
          'FOLIO 8: Compañía de Seguros Bolívar S.A. Póliza No. 99204-2. Amparo: Calidad del servicio por el 20 % del valor, vigente por 48 meses (plazo de 36 meses más 1 año adicional).',
      },
      {
        folioNumber: 'Folio 9',
        documentTitle: 'Formulario de Oferta Económica',
        issueDate: '2026-09-17',
        excerpt:
          'FOLIO 9: Oferta Económica CLOUDSYS SAS. Valor total ofertado con IVA incluido: $2.210.000.000 COP.',
      },
    ],
  },
];

// Proponente E opcional para probar la Mejora de Tabla 6: "Ampliar el caso con un proponente que no aporte un documento"
export const EXTENDED_TEST_PROPONENT_E: ProponentData = {
  id: 'PROP-E',
  code: 'Proponente E',
  name: 'Proponente E — NexaGov IT SAS (Caso Tabla 6: Omisión Documental)',
  nit: '901.442.190-5',
  offeredConfiguration:
    'Fabricante HiperCore Technologies Inc. — Clúster 6 Nodos HCI + Licenciamiento [PENDIENTE DE VERIFICACIÓN]',
  economicOfferValue: 2320000000,
  economicOfferFolio: 'Folio 7',
  isExtendedTestCase: true,
  financials: {
    cutoffDate: '2025-12-31',
    requiredCutoffYear: 2025,
    activoCorriente: 2500000000,
    pasivoCorriente: 1000000000,
    activoTotal: 4800000000,
    pasivoTotal: 2400000000,
    folio: 'Folio 6',
  },
  committeeGlobalDecision: 'PENDIENTE DEL COMITÉ',
  committeeGlobalNote:
    'Caso de prueba de la Tabla 6 (Mejoras priorizadas): El proponente omitió aportar el certificado del ingeniero (Folio 5) y la póliza de calidad del servicio. El asistente marca obligatoriamente NO APORTADO sin deducir ni rellenar el vacío.',
  documentaryRows: [
    {
      requirementId: 'REQ-T1',
      numeral: '4.1',
      component: 'Técnico',
      requirementTitle: 'Dos contratos HCI (últimos 5 años, >= 50% PO)',
      whatPresents:
        '2 certificaciones con redacción libre emparejada por Glosario: "Plataforma convergente definida por software SDDC" ($1.410.000.000 y $1.290.000.000).',
      folio: 'Folios 2-3',
      proposedStatus: 'CUMPLE',
      findingNote:
        'Emparejado mediante Glosario de Equivalencias (Tabla 6) como equivalente a infraestructura hiperconvergente.',
      committeeObservation: 'Validada equivalencia técnica por el comité.',
      committeeRowDecision: 'ACEPTADO',
    },
    {
      requirementId: 'REQ-T2',
      numeral: '4.2',
      component: 'Técnico',
      requirementTitle: 'Certificación vigente del fabricante',
      whatPresents:
        'Certificado del fabricante HiperCore Technologies Inc. autorizado, vigente hasta 31/12/2027.',
      folio: 'Folio 4',
      proposedStatus: 'CUMPLE',
      findingNote: 'Certificación vigente verificada en Folio 4.',
      committeeObservation: 'Conforme.',
      committeeRowDecision: 'ACEPTADO',
    },
    {
      requirementId: 'REQ-T3',
      numeral: '4.3',
      component: 'Técnico',
      requirementTitle: 'Un ingeniero certificado en la plataforma ofertada',
      whatPresents: 'Aporta Hoja de Vida del Ingeniero Líder. NO APORTADO certificado técnico en la plataforma.',
      folio: 'Folio 5',
      proposedStatus: 'REQUIERE SUBSANACION',
      findingNote:
        'En el Folio 5 reposa únicamente la hoja de vida; el certificado de acreditación en la plataforma aparece como NO APORTADO.',
      committeeObservation: 'Pendiente requerimiento al proponente.',
      committeeRowDecision: 'SUBSANAR',
    },
    {
      requirementId: 'REQ-G1',
      numeral: '6.1',
      component: 'Garantías',
      requirementTitle: 'Garantía de cumplimiento (20%, plazo + 6 meses)',
      whatPresents:
        'Póliza Liberty No. 55102-1: Amparo de cumplimiento por el 20 % del valor, vigencia 42 meses.',
      folio: 'Folio 6-B',
      proposedStatus: 'CUMPLE',
      findingNote: 'Cumple amparo, porcentaje y vigencia.',
      committeeObservation: 'Conforme.',
      committeeRowDecision: 'ACEPTADO',
    },
    {
      requirementId: 'REQ-G2',
      numeral: '6.2',
      component: 'Garantías',
      requirementTitle: 'Garantía de calidad del servicio (20%, plazo + 1 año)',
      whatPresents: 'NO APORTADO',
      folio: 'N/A',
      proposedStatus: 'REQUIERE SUBSANACION',
      findingNote:
        'Ausencia total del documento de Garantía de Calidad del Servicio en el expediente. Se marca NO APORTADO sin deducir vigencia.',
      committeeObservation: 'Verificar en expediente si es subsanable o causal de rechazo.',
      committeeRowDecision: 'PENDIENTE',
    },
  ],
  folios: [
    {
      folioNumber: 'Folios 2-3',
      documentTitle: 'Certificaciones de Experiencia con Redacción Libre (Glosario)',
      issueDate: '2026-08-11',
      excerpt:
        'FOLIO 2: Certificación Superintendencia Financiera. Objeto: "Adquisición de plataforma convergente definida por software (SDDC) de cómputo y almacenamiento". Valor: $1.410.000.000.\nFOLIO 3: Certificación Sena. Objeto: "Suministro de clúster hiperconvergente de cómputo y almacenamiento definido por software". Valor: $1.290.000.000.',
    },
    {
      folioNumber: 'Folio 4',
      documentTitle: 'Certificado de Fabricante HiperCore Technologies Inc.',
      issueDate: '2026-02-12',
      excerpt:
        'FOLIO 4: HiperCore Technologies Inc. acredita a NEXAGOV IT SAS como canal autorizado vigente hasta diciembre de 2027.',
    },
    {
      folioNumber: 'Folio 5',
      documentTitle: 'Hoja de Vida Ingeniero Líder (Sin Certificado Adjunto)',
      issueDate: '2026-09-05',
      excerpt:
        'FOLIO 5: Se adjunta únicamente formato de Hoja de Vida de la Función Pública del Ing. Mauricio Cárdenas. [OMISIÓN DOCUMENTAL: No se encuentra adjunto el certificado del fabricante en la plataforma ofertada].',
    },
    {
      folioNumber: 'Folio 6',
      documentTitle: 'Estados Financieros a 31 de Diciembre de 2025',
      issueDate: '2026-03-19',
      excerpt:
        'FOLIO 6: Balance General a 31/12/2025. Activo Corriente: $2.500.000.000. Pasivo Corriente: $1.000.000.000 (Liquidez = 2,50). Activo Total: $4.800.000.000. Pasivo Total: $2.400.000.000 (Endeudamiento = 50,0 %).',
    },
    {
      folioNumber: 'Folio 6-B',
      documentTitle: 'Póliza de Cumplimiento (Omite Póliza de Calidad del Servicio)',
      issueDate: '2026-09-14',
      excerpt:
        'FOLIO 6-B: Póliza Liberty Seguros No. 55102-1. Amparo: Cumplimiento del contrato por el 20 %, vigencia 42 meses. [OMISIÓN TOTAL: El proponente NO APORTA póliza ni anexo para el amparo de Calidad del Servicio exigido en el numeral 6.2].',
    },
    {
      folioNumber: 'Folio 7',
      documentTitle: 'Oferta Económica Total',
      issueDate: '2026-09-17',
      excerpt:
        'FOLIO 7: Oferta Económica NEXAGOV IT SAS. Valor total ofertado con IVA incluido: $2.320.000.000 COP.',
    },
  ],
};

export const PROMPTS_LIBRARY: PromptRecord[] = [
  {
    id: 'P1',
    stepNumber: 1,
    title: 'Prompt 1: Generar los términos de referencia',
    toolUsed: 'ChatGPT (versión Plus)',
    purpose:
      'Estructurar los términos de referencia con numerales jerarquizados citables uno por uno, especificando con qué documento se acredita cada requisito y los índices financieros calculables.',
    outputFormat: 'Archivo de Word (.docx) descargable con numerales jerarquizados',
    shareUrl: 'https://chatgpt.com/share/6a9095f5-91a8-83e9-91f2-ddad9f3df6f6',
    promptText: `Actúa como abogado de contratación pública redactando los términos de referencia de un proceso.

Contexto: una entidad pública colombiana abrió un proceso para adquirir una infraestructura de hiperconvergencia (nodos, licenciamiento, soporte a 3 años e instalación). El presupuesto oficial es de $2.400.000.000 con IVA incluido.

Tarea: redacta los términos de referencia del proceso, con numerales que se puedan citar uno por uno.

El documento debe contener:
- objeto, presupuesto oficial y plazo de ejecución,
- requisitos habilitantes técnicos,
- requisitos de capacidad financiera,
- garantías exigidas,
- reglas de evaluación económica.

Condiciones que deben cumplirse:
- Cada requisito habilitante indica con qué documento se acredita.
- Los requisitos financieros son índices calculables a partir de los estados financieros del proponente.
- Las garantías especifican amparo, porcentaje del valor y vigencia exigida.
- Las reglas económicas son las dos ya definidas: rechazo por superar el presupuesto oficial y requerimiento por precio artificialmente bajo.

Formato de salida: archivo de Word (.docx) descargable, con numerales jerarquizados para poder citar cada requisito por su número en el informe de evaluación. Si no puedes generar Word, entrégalo en PDF.`,
  },
  {
    id: 'P2',
    stepNumber: 2,
    title: 'Prompt 2: Generar las respuestas de los proponentes',
    toolUsed: 'ChatGPT (versión Plus)',
    purpose:
      'Generar cuatro expedientes independientes (Propuesta_Proponente_A, B, C y D) con folios numerados y cuatro situaciones distintas sin revelar en el texto cuál tiene cada defecto.',
    outputFormat: 'Cuatro archivos Excel (.xlsx) independientes con folios numerados',
    shareUrl: 'https://chatgpt.com/share/6a90960d-ecf0-83e9-b16e-57ed416925e3',
    promptText: `Necesito las respuestas de los proponentes para probar el método de evaluación.

Contexto: te adjunto los términos de referencia del proceso de hiperconvergencia, con los requisitos habilitantes y las reglas de evaluación económica.

Tarea: genera CUATRO ARCHIVOS INDEPENDIENTES, uno por proponente, con los documentos de habilitación y la oferta económica de cada uno. Nómbralos Propuesta_Proponente_A, B, C y D.

Cada archivo debe contener:
- certificaciones de experiencia con objeto, valor y fecha,
- certificado del fabricante con su vigencia,
- hoja de vida del ingeniero propuesto,
- estados financieros con activo corriente, pasivo corriente, activo total y pasivo total,
- las dos garantías con amparo, porcentaje y vigencia,
- la oferta económica con el valor total.

Condiciones que deben cumplirse entre los cuatro:
- Uno cumple todos los requisitos.
- Uno presenta el certificado del fabricante vencido.
- Uno no alcanza el índice de liquidez exigido.
- Uno presenta la garantía de cumplimiento con vigencia menor a la exigida.
- No señales cuál es cuál: los defectos deben encontrarse leyendo los documentos.

Formato de los archivos: Excel (.xlsx), uno por proponente, con los folios numerados para poder citarlos. Si no puedes generar Excel, entrégalos en PDF.`,
  },
  {
    id: 'P3',
    stepNumber: 3,
    title: 'Prompt 3: Construir la hoja de evaluación (3 pestañas con FÓRMULAS)',
    toolUsed: 'Gemini',
    purpose:
      'Construir Hoja_evaluacion.xlsx con tres pestañas (Requisitos habilitantes, Indicadores financieros, Evaluación económica) conservando la regla inviolable: todas las celdas de resultado deben contener FÓRMULAS de Excel y nunca el número ya calculado.',
    outputFormat: 'ArchivoHoja_evaluacion.xlsx con 3 hojas y parámetros en celdas propias',
    shareUrl: 'https://share.gemini.google/GYsayK1QL04Z',
    promptText: `Actúa como analista de contratación pública.

Contexto: te adjunto los cuatro archivos de propuesta y los términos de referencia del proceso, cuyo presupuesto oficial es de $2.400.000.000.

Tarea: genera un archivo de Excel llamado Hoja_evaluacion con tres hojas.

Hoja 1, Requisitos habilitantes:
- una fila por proponente y requisito, con el numeral de los términos de referencia,
- qué presenta el proponente y el folio donde aparece,
- columna de estado propuesto entre CUMPLE, REQUIERE SUBSANACION y NO CUMPLE.

Hoja 2, Indicadores financieros:
- las cifras de cada estado financiero copiadas tal cual,
- liquidez y endeudamiento calculados con FORMULA,
- una columna que compare cada índice contra el mínimo exigido, con fórmula.

Hoja 3, Evaluacion economica:
- solo los proponentes habilitados,
- las dos reglas: si supera el presupuesto oficial, RECHAZADA; si queda por debajo del umbral del promedio, REQUIERE EXPLICACION,
- estado, puntaje y orden de elegibilidad.

REGLA QUE NO PUEDES ROMPER:
Todas las celdas de resultado deben contener FORMULAS de Excel, nunca el número ya calculado. Tú escribes la fórmula; Excel hace la cuenta.

No corrijas ninguna cifra de los documentos. Si un dato no aparece, escribe NO APORTADO; no lo deduzcas.

Formato de salida: archivo .xlsx descargable, con las tres hojas nombradas como se indica y los parámetros en celdas propias.`,
  },
  {
    id: 'P4',
    stepNumber: 4,
    title: 'Prompt 4: Armar el documento de evaluación definitivo',
    toolUsed: 'Gemini',
    purpose:
      'Redactar el documento oficial de evaluación listo para publicar con sus 6 apartados, tomando únicamente las cifras calculadas por Excel y presentando los estados de habilitación como PROPUESTOS al comité evaluador.',
    outputFormat: 'Documento estructurado con títulos numerados y tablas exportables a Word',
    shareUrl: 'https://share.gemini.google/bUdqq0R3EwdD',
    promptText: `Actúa como abogado de contratación pública elaborando el documento de evaluación definitivo.

Contexto: te adjunto la hoja de evaluación en Excel, que ya trae la verificación de requisitos, los indicadores calculados y la evaluación económica. Esos números los calculó Excel, no tú.

Tarea: redacta el documento de evaluación, listo para ser publicado, con estos seis apartados:
1. Identificación del proceso: objeto, modalidad, presupuesto oficial y fecha de cierre.
2. Proponentes que participaron: tabla con cada proponente y la configuración que ofreció.
3. Verificación técnica: requisito por requisito, con el numeral y el folio de respaldo.
4. Verificación de capacidad financiera: los índices obtenidos frente al mínimo exigido.
5. Verificación de garantías: amparo, porcentaje y vigencia de cada póliza.
6. Evaluación económica de las habilitadas: promedio, umbral, puntajes y orden de elegibilidad.

REGLAS:
- Usa únicamente los datos de la hoja adjunta. Si falta algo, escribe [PENDIENTE DE VERIFICACION]; no lo inventes ni lo deduzcas.
- No recalcules nada: los números ya vienen calculados por Excel.
- Cada afirmación cita el numeral de los términos de referencia y el folio.
- Los estados de habilitación se presentan como PROPUESTOS al comité evaluador, nunca como decisión del análisis.
- Menciona el valor de cada oferta cada vez que la nombres.
- Tono formal e impersonal, sin adjetivos ni valoraciones.

Formato de salida: documento completo, con títulos numerados y tablas de verdad, para poder exportarlo a Word sin rehacerle el formato.`,
  },
  {
    id: 'P5',
    stepNumber: 5,
    title: 'Prompt 5: El tablero de revisión del comité',
    toolUsed: 'Gemini',
    purpose:
      'Generar un tablero interactivo autocontenido en HTML para que el comité evaluador revise el conjunto de un vistazo antes de firmar, manteniendo la leyenda visible de estados propuestos.',
    outputFormat: 'Archivo único .html autocontenido sin dependencias externas',
    shareUrl: 'https://share.gemini.google/MYo0nY9XbPAZ',
    promptText: `Actúa como analista de datos preparando un tablero de revisión para el comité evaluador.

Contexto: te adjunto la hoja de evaluación en Excel, que ya trae la verificación de requisitos, los indicadores financieros y la evaluación económica. Esos números los calculó Excel, no tú.

Tarea: genera un tablero que permita al comité revisar el proceso de un vistazo, con estos bloques:
1. Tira de indicadores: proponentes que se presentaron, habilitados, con subsanación y no habilitados.
2. Matriz de requisitos por proponente: con filtro por componente: técnico, financiero y garantías.
3. Capacidad financiera: liquidez y endeudamiento de cada proponente frente al mínimo exigido.
4. Ofertas económicas: valor de cada oferta frente al presupuesto oficial y al umbral de precio bajo.
5. Orden de elegibilidad: solo de las ofertas habilitadas.

REGLAS:
- Toma todas las cifras de la hoja adjunta. No recalcules ni estimes nada.
- Los estados se muestran como PROPUESTOS al comité evaluador, con la leyenda visible en el tablero.
- Cada fila de la matriz conserva el numeral de los términos de referencia y el folio de respaldo.
- Si un dato no está en la hoja, muestra NO APORTADO.

Formato de salida: un único archivo .html autocontenido, sin dependencias externas ni conexión a internet, que se abra con doble clic en cualquier navegador.`,
  },
];

export const BITACORA_ADJUSTMENTS: BitacoraAdjustment[] = [
  {
    id: 'BIT-1',
    promptCode: 'P1',
    whatFailed:
      'Los requisitos salieron redactados en términos generales, sin decir con qué documento se acreditan.',
    whatChanged: 'Pedí que cada requisito indicara su forma de acreditación documental o de cálculo.',
    result: 'Quedaron verificables uno por uno contra el expediente.',
  },
  {
    id: 'BIT-2',
    promptCode: 'P2',
    whatFailed: 'Las cuatro respuestas cumplían todos los requisitos (cuatro propuestas equivalentes).',
    whatChanged: 'Agregué las condiciones explícitas de incumplimiento sembradas entre los cuatro.',
    result: 'El caso quedó con situaciones reales y distintas que evaluar.',
  },
  {
    id: 'BIT-3',
    promptCode: 'P2',
    whatFailed: 'El modelo señalaba en el texto cuál proponente traía cada defecto.',
    whatChanged: 'Agregué la instrucción expresa de no indicar cuál corresponde a cada uno.',
    result: 'Los defectos hay que encontrarlos leyendo los documentos foliados.',
  },
  {
    id: 'BIT-4',
    promptCode: 'P3',
    whatFailed: 'Calculó los índices financieros y escribió el número resultado directamente en la celda.',
    whatChanged: 'Repetí la regla inviolable de fórmulas también para la hoja de indicadores financieros.',
    result: 'El índice lo calcula Excel (=B2/C2) y la fórmula queda visible y auditable en la barra.',
  },
  {
    id: 'BIT-5',
    promptCode: 'P3',
    whatFailed: 'Completó una vigencia que no aparecía en la póliza por deducción.',
    whatChanged: 'Agregué la instrucción obligatoria de escribir NO APORTADO cuando el dato no esté.',
    result: 'El vacío quedó reportado explícitamente en lugar de rellenado.',
  },
  {
    id: 'BIT-6',
    promptCode: 'P4',
    whatFailed: 'Redactó como hecho definitivo que un proponente "queda no habilitado".',
    whatChanged: 'Exigí que los estados se presenten como PROPUESTOS al comité evaluador.',
    result: 'El documento propone con folio de respaldo y nunca decide por sí mismo.',
  },
  {
    id: 'BIT-7',
    promptCode: 'P5',
    whatFailed: 'El tablero recalculaba los índices en lugar de tomarlos de la hoja de cálculo.',
    whatChanged: 'Agregué la instrucción de no recalcular ni estimar nada en la visualización.',
    result: 'El tablero muestra exactamente las cifras de la hoja, no calcula.',
  },
];

export const DIAGNOSTIC_TABLE_1 = [
  {
    criterion: 'Volumen y frecuencia',
    score: '12 / 15',
    justification:
      'Ocurre en todo proceso de contratación inmediatamente después del cierre, y crece multiplicativamente con el número de proponentes y de requisitos exigidos (4 proponentes × 7 requisitos = 28 verificaciones).',
  },
  {
    criterion: 'Naturaleza de la tarea',
    score: '11 / 15',
    justification:
      'Es casi toda lectura y contraste de documentos semiestructurados (certificaciones, pólizas, hojas de vida), que es donde las herramientas de IA generativa rinden mejor.',
  },
  {
    criterion: 'Complejidad del juicio',
    score: '7 / 15',
    justification:
      'Decidir si un documento acredita lo exigido, y si una falla es subsanable o insubsanable, tiene un componente jurídico con consecuencias legales directas que no admite delegación.',
  },
  {
    criterion: 'Resultado del diagnóstico',
    score: 'Automatización asistida',
    justification:
      'El modelo prepara la matriz y propone el estado citando el folio de respaldo; los cocientes los calcula la hoja con fórmulas; la habilitación definitiva la decide y firma el comité.',
  },
];

export const ETHICAL_RISKS_TABLE_4: RiskItem[] = [
  {
    id: 'RISK-1',
    risk: 'Que el modelo declare no habilitado a un proponente',
    mitigation:
      'La matriz solo contiene estados propuestos con su folio; la habilitación es una decisión del comité y el documento lo dice expresamente.',
    implementedInApp:
      'Leyenda permanente "ESTADOS PROPUESTOS AL COMITÉ EVALUADOR" y selector de decisión humana separado de la propuesta del modelo.',
  },
  {
    id: 'RISK-2',
    risk: 'Confundir lo subsanable con lo no subsanable',
    mitigation:
      'El asistente describe el hallazgo y no lo clasifica jurídicamente; esa calificación la hace el comité con el expediente a la vista.',
    implementedInApp:
      'Inspector de folios en línea + columna de Observación y Calificación Jurídica del Comité en cada renglón.',
  },
  {
    id: 'RISK-3',
    risk: 'Indicadores financieros producidos por el modelo',
    mitigation:
      'Los índices se calculan con fórmulas en la hoja a partir de las cifras copiadas; el modelo no produce ningún cociente.',
    implementedInApp:
      'Motor determinista de hoja de cálculo con barra de fórmulas interactiva (=B2/C2, =SI(...)) y auditor de integridad de fórmulas.',
  },
  {
    id: 'RISK-4',
    risk: 'Estados o vigencias inventados donde falta el documento',
    mitigation:
      'Marca obligatoria NO APORTADO y [PENDIENTE DE VERIFICACIÓN], con instrucción expresa de no deducir.',
    implementedInApp:
      'Validación estricta en el prompt de Gemini y resaltado automático de celdas NO APORTADO / [PENDIENTE DE VERIFICACIÓN].',
  },
  {
    id: 'RISK-5',
    risk: 'Trato desigual entre proponentes',
    mitigation:
      'El mismo prompt y el mismo orden para todos, y verificación cruzada de los cuatro archivos contra el mismo listado de requisitos.',
    implementedInApp:
      'Ejecución estandarizada contra los 7 numerales de los TDR (4.1 a 6.2) en el mismo orden para todos los oferentes.',
  },
  {
    id: 'RISK-6',
    risk: 'Información de proponentes en un servicio externo',
    mitigation:
      'Mientras el ejercicio use un caso de prueba el riesgo es bajo; para un proceso real, anonimización previa y exclusión de documentos con datos personales.',
    implementedInApp:
      'Modo de anonimización de expediente y control de trazabilidad local antes de enviar fragmentos al modelo.',
  },
  {
    id: 'RISK-7',
    risk: 'Que el tablero se confunda con el entregable oficial',
    mitigation:
      'El documento de evaluación es el único que se publica; el tablero lleva la leyenda de estados propuestos y queda como herramienta interna de revisión.',
    implementedInApp:
      'Distinción explícita entre el Tablero Interno de Revisión (.html) y el Documento de Evaluación Definitivo para publicación.',
  },
  {
    id: 'RISK-8',
    risk: 'Falta de trazabilidad frente a un control posterior',
    mitigation:
      'Una conversación por proceso, con prompts, salidas y versiones del documento archivados en el expediente.',
    implementedInApp:
      'Bitácora de auditoría con enlaces a las 5 sesiones de prueba, auditoría de fórmulas y exportación completa del expediente.',
  },
];

export const PRIORITY_IMPROVEMENTS_TABLE_6: ImprovementItem[] = [
  {
    id: 'IMP-1',
    improvement: 'Glosario de equivalencias para objetos contractuales',
    whatItFixes:
      'Las certificaciones reales describen el mismo objeto de maneras distintas y eso degrada la verificación de experiencia.',
    priority: 'Alta',
    statusInApp: 'Implementado y editable en la pestaña de Metodología y en el verificador Gemini.',
  },
  {
    id: 'IMP-2',
    improvement: 'Columna de fecha de corte en los estados financieros',
    whatItFixes:
      'Hoy la hoja calcula los índices sin verificar que correspondan a la vigencia fiscal exigida (31/12/2025).',
    priority: 'Alta',
    statusInApp: 'Implementado en la Hoja 2 (Indicadores Financieros) con validación de vigencia.',
  },
  {
    id: 'IMP-3',
    improvement: 'Casilla de observación del comité en cada renglón de la matriz',
    whatItFixes:
      'Deja registrada la decisión humana junto a la propuesta del asistente, en el mismo documento.',
    priority: 'Media',
    statusInApp: 'Implementado en cada fila del Tablero del Comité y en la Hoja 1 de Requisitos.',
  },
  {
    id: 'IMP-4',
    improvement: 'Verificación de que las celdas conserven fórmula antes de archivar',
    whatItFixes:
      'Protege la trazabilidad del cálculo en la copia que llega al expediente (evita valores pegados como texto).',
    priority: 'Media',
    statusInApp: 'Implementado: botón de "Auditoría de Fórmulas" que inspecciona las 3 hojas.',
  },
  {
    id: 'IMP-5',
    improvement: 'Que el tablero muestre el folio al pasar el cursor sobre cada fila',
    whatItFixes:
      'Hoy el folio está en la matriz pero obliga a desplazarse al expediente; verlo en el sitio agiliza la revisión.',
    priority: 'Media',
    statusInApp: 'Implementado: vista previa instantánea del extracto del folio al pasar el cursor o hacer clic.',
  },
  {
    id: 'IMP-6',
    improvement: 'Ampliar el caso con un proponente que no aporte un documento',
    whatItFixes:
      'Permite probar el comportamiento del asistente ante la ausencia total (NO APORTADO), no solo ante el defecto.',
    priority: 'Baja',
    statusInApp: 'Implementado: interruptor en vivo para activar al Proponente E (NexaGov IT SAS).',
  },
];
