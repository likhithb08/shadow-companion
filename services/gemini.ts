import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

// Helper to check key
export const hasApiKey = () => !!API_KEY;

export const generateAIUpdates = async (): Promise<any[]> => {
  if (!API_KEY) return [];
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Generate 4 fictional but realistic "Breaking AI News" updates for today. 
  Format as JSON array of objects with keys: id, title, summary, source, date, tags. 
  Make them sound professional and exciting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to generate updates", e);
    return [];
  }
};

export const generateFeedPost = async (topic: string): Promise<any> => {
  if (!API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Write a short social media post about ${topic} in the voice of an AI enthusiast.
  Return JSON: { "content": "text", "author": "UserHandle" }`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: {
        responseMimeType: 'application/json'
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to gen post", e);
    return null;
  }
};