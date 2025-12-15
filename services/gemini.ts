import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { INITIAL_SYSTEM_PROMPT, LANGUAGES } from "../constants";
import { TrendAnalysisResult, LanguageCode } from "../types";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

const getLanguageInstruction = (langCode: LanguageCode) => {
  const langName = LANGUAGES.find(l => l.code === langCode)?.promptName || 'English';
  return `IMPORTANT: Respond strictly in ${langName}.`;
};

export const generateMarketAnalysis = async (
  prompt: string,
  contextData?: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    const fullPrompt = contextData 
      ? `Context Data: ${contextData}\n\nUser Question: ${prompt}`
      : prompt;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: INITIAL_SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Analysis service is currently unavailable. Please check your connection or API key.";
  }
};

export const streamMarketAnalysis = async function* (
  prompt: string,
  contextData: string,
  language: LanguageCode
) {
    const ai = getClient();
    const langInstruction = getLanguageInstruction(language);
    
    const fullPrompt = `Context Data: ${contextData}\n\nUser Question: ${prompt}\n\n${langInstruction}`;

    const streamResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction: INITIAL_SYSTEM_PROMPT,
        }
    });

    for await (const chunk of streamResponse) {
        yield chunk.text || "";
    }
}

export const generateTrendAnalysis = async (
  coinName: string,
  contextData: string,
  language: LanguageCode
): Promise<TrendAnalysisResult | null> => {
  const ai = getClient();
  const langName = LANGUAGES.find(l => l.code === language)?.promptName || 'English';

  const prompt = `Analyze the provided market data for ${coinName}. 
  Based on the price history and volatility in the context, determine the current trend, support/resistance levels, and sentiment.
  Provide a strictly valid JSON response.
  Translate the 'keyNarrative' and 'actionableInsight' values into ${langName}.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      sentimentScore: { type: Type.NUMBER, description: "A score from 0 (Bearish) to 100 (Bullish)" },
      trend: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
      confidence: { type: Type.NUMBER, description: "Confidence percentage 0-100" },
      supportLevels: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "List of 3 estimated support prices" },
      resistanceLevels: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "List of 3 estimated resistance prices" },
      keyNarrative: { type: Type.STRING, description: `A one sentence summary of the market driver in ${langName}` },
      actionableInsight: { type: Type.STRING, description: `A concise actionable tip for a trader in ${langName}` }
    },
    required: ["sentimentScore", "trend", "confidence", "supportLevels", "resistanceLevels", "keyNarrative", "actionableInsight"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: ${contextData}\n\nTask: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as TrendAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Trend Analysis Error:", error);
    return null;
  }
};