import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Endpoint 1: Verificación documental asistida con Gemini (Frontera: solo propone y cita folio, nunca calcula índices ni decide jurídicamente)
  app.post('/api/gemini/verify-proponent', async (req, res) => {
    try {
      const { proponent, requirements, glossary } = req.body;
      const ai = getGenAIClient();

      const prompt = `Actúa como analista de contratación pública ejecutando el componente de verificación documental de EVAL-OFERTA GenAI (Fase II).

REGLAS ESTRICTAS E INVIOLABLES:
1. Solo verificas requisitos DOCUMENTALES (Técnicos y Garantías). Los requisitos financieros los calcula la hoja de cálculo con fórmulas, no tú.
2. Por cada requisito documental, debes indicar exactamente qué presenta el proponente y citar el FOLIO exacto donde aparece el respaldo.
3. Si un dato o documento no aparece en los folios del proponente, escribe obligatoriamente "NO APORTADO" en qué presenta y "N/A" en folio; NUNCA lo deduzcas ni inventes vigencias.
4. Usa el Glosario de Equivalencias adjunto para reconocer objetos contractuales equivalentes en certificaciones de experiencia.
5. La columna de estado propuesto solo puede ser: "CUMPLE", "REQUIERE SUBSANACION" o "NO CUMPLE". Recuerda que este estado es una PROPUESTA al comité evaluador, no una decisión jurídica definitiva. Describe el hallazgo de forma objetiva e impersonal.

GLOSARIO DE EQUIVALENCIAS DE OBJETOS CONTRACTUALES:
${JSON.stringify(glossary, null, 2)}

REQUISITOS DOCUMENTALES EN LOS TÉRMINOS DE REFERENCIA:
${JSON.stringify(requirements, null, 2)}

EXPEDIENTE FOLIADO DEL PROPONENTE (${proponent.name}):
${JSON.stringify(proponent.folios, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                requirementId: {
                  type: Type.STRING,
                  description: 'ID del requisito (ej. REQ-T1, REQ-G1)',
                },
                numeral: {
                  type: Type.STRING,
                  description: 'Numeral de los términos de referencia (ej. 4.1, 4.2, 6.1)',
                },
                whatPresents: {
                  type: Type.STRING,
                  description: 'Qué presenta el proponente o NO APORTADO si falta',
                },
                folio: {
                  type: Type.STRING,
                  description: 'Folio citado (ej. Folios 2-3, Folio 4, o N/A si NO APORTADO)',
                },
                proposedStatus: {
                  type: Type.STRING,
                  description: 'Estado propuesto: CUMPLE, REQUIERE SUBSANACION, o NO CUMPLE',
                },
                findingNote: {
                  type: Type.STRING,
                  description: 'Descripción objetiva del hallazgo documental sin calificación jurídica definitiva',
                },
              },
              required: [
                'requirementId',
                'numeral',
                'whatPresents',
                'folio',
                'proposedStatus',
                'findingNote',
              ],
            },
          },
        },
      });

      const text = response.text || '[]';
      const parsed = JSON.parse(text);
      res.json({ verifications: parsed });
    } catch (error: any) {
      console.error('Error in /api/gemini/verify-proponent:', error);
      res.status(500).json({
        error: error?.message || 'Error al ejecutar la verificación documental en Gemini.',
      });
    }
  });

  // Endpoint 2: Prompt 4 - Redactar el Documento de Evaluación Definitivo a partir de los datos de la Hoja de Evaluación
  app.post('/api/gemini/generate-report', async (req, res) => {
    try {
      const { processInfo, spreadsheetData } = req.body;
      const ai = getGenAIClient();

      const prompt = `Actúa como abogado de contratación pública elaborando el documento de evaluación definitivo (Prompt 4 de EVAL-OFERTA GenAI Fase II).

Contexto: te adjunto los datos exactos de la hoja de evaluación en Excel, que ya trae la verificación de requisitos, los indicadores calculados con fórmula y la evaluación económica. Esos números los calculó la hoja de cálculo, no tú.

Tarea: redacta el documento de evaluación, listo para ser publicado, con estos seis apartados claramente estructurados:
1. Identificación del proceso (objeto, modalidad, presupuesto oficial y fecha de cierre).
2. Proponentes que participaron (tabla o relación detallada con cada proponente, valor ofertado y la configuración que ofreció).
3. Verificación técnica (requisito por requisito, con el numeral y el folio de respaldo).
4. Verificación de capacidad financiera (los índices obtenidos frente al mínimo exigido, indicando fecha de corte).
5. Verificación de garantías (amparo, porcentaje y vigencia de cada póliza con su folio).
6. Evaluación económica de las habilitadas (promedio, umbral de precio artificialmente bajo, puntajes y orden de elegibilidad, explicando por qué las ofertas no habilitadas no entran al cálculo del promedio).

REGLAS OBLIGATORIAS:
- Usa únicamente los datos de la hoja adjunta. Si falta algo, escribe [PENDIENTE DE VERIFICACIÓN]; no lo inventes ni lo deduzcas.
- No recalcules nada: los números ya vienen calculados por la hoja de cálculo.
- Cada afirmación cita el numeral de los términos de referencia y el folio.
- Los estados de habilitación se presentan como PROPUESTOS al comité evaluador, nunca como decisión del análisis (incluye las observaciones registradas por el comité si existen).
- Menciona el valor de cada oferta cada vez que la nombres.
- Tono formal e impersonal, sin adjetivos ni valoraciones.

DATOS DEL PROCESO:
${JSON.stringify(processInfo, null, 2)}

DATOS DE LA HOJA DE EVALUACIÓN (CALCULADOS POR FÓRMULA Y MATRIZ DE FOLIOS):
${JSON.stringify(spreadsheetData, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ reportText: response.text || '' });
    } catch (error: any) {
      console.error('Error in /api/gemini/generate-report:', error);
      res.status(500).json({
        error: error?.message || 'Error al generar el documento de evaluación definitivo.',
      });
    }
  });

  // Endpoint 3: Laboratorio interactivo de Prompts (Permite ejecutar cualquiera de los 5 prompts del flujo)
  app.post('/api/gemini/run-prompt', async (req, res) => {
    try {
      const { promptText, contextSummary } = req.body;
      const ai = getGenAIClient();

      const fullPrompt = `${promptText}\n\n--- DATOS DE ENTRADA ADJUNTOS AL PROMPT ---\n${contextSummary}`;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
      });

      res.json({ output: response.text || '' });
    } catch (error: any) {
      console.error('Error in /api/gemini/run-prompt:', error);
      res.status(500).json({
        error: error?.message || 'Error al ejecutar el prompt en Gemini.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EVAL-OFERTA GenAI server running on http://localhost:${PORT}`);
  });
}

startServer();
