import { GoogleGenAI, FunctionDeclaration, Tool, Content } from "@google/genai";

const API_KEY = import.meta.env.VITE_API_KEY || 'AIzaSyDygVTJCzte-IL4vwlM9gG-TdYNct3WR54';

// Helper to check key
export const hasApiKey = () => !!API_KEY;

export const generateAIUpdates = async (): Promise<any[]> => {
  if (!API_KEY) return [];

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `Generate 4 reatime but realistic "Breaking AI News" updates for today. 
  Format as JSON array of objects with keys: id, title, summary, content, source, date, tags. 
  'content' should be a detailed paragraph (3-4 sentences) explaining the update in depth, suitable for reading aloud.
  Make them sound professional and exciting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Keep standard Flash for general generation
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // OPTIMIZATION: Disable thinking for speed
        thinkingConfig: { thinkingBudget: 0 }
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
      model: 'gemini-flash-lite-latest', // Use Flash-Lite for low latency
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // Flash Lite doesn't support thinking config usually, but we'll omit it to be safe or keep 0
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to gen post", e);
    return null;
  }
};

export const refineText = async (text: string, instruction: string = "Make it concise and professional"): Promise<string> => {
  if (!API_KEY) return text;
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Use Flash-Lite for fast edits
      contents: `Refine the following text. Instruction: ${instruction}. Text: "${text}". Return only the refined text.`,
    });
    return response.text?.trim() || text;
  } catch (e) {
    console.error("Failed to refine text", e);
    return text;
  }
};

export const generatePersonaReply = async (persona: string, lastMessage: string): Promise<string> => {
  if (!API_KEY) return "...";
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `You are roleplaying as a character. 
        Character Persona: ${persona}
        User sent: "${lastMessage}"
        
        Reply to the user in character. Keep it short (under 20 words), casual, and like a real-time chat message. Do not use hashtags.`,
    });
    return response.text?.trim() || "Interesting!";
  } catch (e) {
    return "Cannot connect to neural link...";
  }
};

// Core Chat Function for Text-Based interaction
export const runChatTurn = async (
  history: Content[],
  newMessage: string,
  tools: FunctionDeclaration[],
  handleToolCall: (name: string, args: any) => Promise<any>
): Promise<string> => {
  if (!API_KEY) return "I'm sorry, I don't have an API key configured.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Convert simple tools list to proper Tool object
  const toolConfig: Tool[] = [{ functionDeclarations: tools }];

  try {
    const chat = ai.chats.create({
      model: 'gemini-flash-lite-latest',
      history: history,
      config: {
        tools: toolConfig,
      }
    });

    let response = await chat.sendMessage({ message: newMessage });

    // Loop to handle potential multiple tool calls
    while (response.candidates && response.candidates[0]?.content?.parts?.some(p => p.functionCall)) {
      const part = response.candidates[0].content.parts.find(p => p.functionCall);
      if (!part || !part.functionCall) break;

      const fc = part.functionCall;
      if (!fc.name) break;

      console.log("Executing Tool:", fc.name, fc.args);

      let result;
      try {
        result = await handleToolCall(fc.name, fc.args);
      } catch (error: any) {
        const msg = error instanceof Error ? error.message : String(error);
        result = { error: msg };
      }

      // Send result back
      response = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: fc.name,
            response: { result: result }
          }
        }]
      });
    }

    return response.text || "I completed the task.";

  } catch (e: any) {
    console.error("Chat Error:", e);
    return `Error: ${e.message}`;
  }
};