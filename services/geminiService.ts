
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MarketingRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Performs deep strategic analysis on REAL parsed data.
 */
export const analyzeMarketingData = async (context: string): Promise<AnalysisResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this REAL marketing dataset from our repository and provide a strategic breakdown in Portuguese. 
    Context: ${context}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resumo: { type: Type.STRING },
          pontosFortes: { type: Type.ARRAY, items: { type: Type.STRING } },
          pontosFracos: { type: Type.ARRAY, items: { type: Type.STRING } },
          estrategia: { type: Type.STRING },
          insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          recomendacoes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["resumo", "pontosFortes", "pontosFracos", "estrategia", "insights", "recomendacoes"]
      }
    }
  });

  return JSON.parse(response.text);
};

/**
 * Searches and ranks data based on semantic relevance using Gemini.
 */
export const semanticSearchQuery = async (query: string, dataSample: string): Promise<number[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Query: "${query}"
    Data: ${dataSample}
    
    Identify the indices of the rows that are most semantically relevant to the query. 
    Return an array of integers representing the indices.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.INTEGER }
      }
    }
  });
  return JSON.parse(response.text);
};

/**
 * Simulates a fine-tuned prediction model by using real historical context.
 */
export const predictRevenue = async (data: {
  c_date: string;
  campaign_name: string;
  category: string;
  impressions: number;
  mark_spent: number;
  clicks: number;
  leads: number;
  orders: number;
}, historicalContext: string): Promise<number> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a fine-tuned RandomForestRegressor model based on the following REAL historical performance:
    
    HISTORICAL CONTEXT:
    ${historicalContext}

    PREDICTION TARGET:
    - Date: ${data.c_date}
    - Campaign: ${data.campaign_name}
    - Category: ${data.category}
    - Impressions: ${data.impressions}
    - Spend: ${data.mark_spent}
    - Clicks: ${data.clicks}
    - Leads: ${data.leads}
    - Orders: ${data.orders}

    Calculate the predicted revenue by identifying patterns in the historical CPA and ROI provided.
    Respond ONLY with a JSON object containing the predicted 'revenue' as a number.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          revenue: { type: Type.NUMBER }
        },
        required: ["revenue"]
      }
    }
  });
  
  const result = JSON.parse(response.text);
  return result.revenue;
};
