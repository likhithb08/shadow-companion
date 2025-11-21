import { GoogleGenAI, FunctionDeclaration, Tool, Content } from "@google/genai";

const API_KEY = process.env.API_KEY || 'AIzaSyBbhcRXiFflh_iv6pch8AtmqCNkF7a4RS4';

// Helper to check key
export const hasApiKey = () => !!API_KEY;

export const generateAIUpdates = async (): Promise<any[]> => {
  if (!API_KEY) return [];
  
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Generate 4 fictional but realistic "Breaking AI News" updates for today. 
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
      model: 'gemini-3-pro-preview', // Use Pro for the Chatbot as requested
      history: history,
      config: {
        tools: toolConfig,
        // Pro model supports thinking, but we might want to keep it responsive. 
        // If user wants "Complex Tasks", we can enable a budget, but usually for chat latency is key.
        // Let's set a small budget or 0.
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    let response = await chat.sendMessage({ message: newMessage });
    
    // Loop to handle potential multiple tool calls
    while (response.candidates && response.candidates[0]?.content?.parts?.some(p => p.functionCall)) {
        const part = response.candidates[0].content.parts.find(p => p.functionCall);
        if (!part || !part.functionCall) break;

        const fc = part.functionCall;
        console.log("Executing Tool:", fc.name, fc.args);
        
        let result;
        try {
            result = await handleToolCall(fc.name, fc.args);
        } catch (err: any) {
            result = { error: err.message };
        }

        // Send result back
        response = await chat.sendMessage({
            message: {
                parts: [{
                    functionResponse: {
                        name: fc.name,
                        response: { result: result }
                    }
                }]
            }
        });
    }

    return response.text || "I completed the task.";

  } catch (e: any) {
    console.error("Chat Error:", e);
    return `Error: ${e.message}`;
  }
};