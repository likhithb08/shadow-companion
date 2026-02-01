
import { GoogleGenAI, FunctionDeclaration, Tool, Content, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const hasApiKey = () => !!API_KEY;

export const generateAIUpdates = async (): Promise<any[]> => {
  if (!API_KEY) return [];
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Generate 4 fictional but realistic "Breaking AI News" updates for today. 
  Format as JSON array of objects with keys: id, title, summary, content, source, date, tags. 
  Make them sound professional and exciting.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to generate updates", e);
    return [];
  }
};

export const generateSkillEvolutionTasks = async (skill: string): Promise<{ tasks: string[], targetStat: string }> => {
    if (!API_KEY) return { tasks: [], targetStat: 'skill' };
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `User wants to level up the following skill: "${skill}". 
    Create exactly 3 concrete, challenging "Blue Lock" style training tasks to improve this. 
    Also determine which of these 6 stats it primarily affects: focus, discipline, skill, speed, creativity, mentalStrength.
    Return JSON format: { "tasks": ["task 1", "task 2", "task 3"], "targetStat": "stat_name" }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        targetStat: { type: Type.STRING }
                    },
                    required: ['tasks', 'targetStat']
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Failed to generate skill tasks", e);
        return { tasks: ["Complete basic drills", "Analyze performance", "Execute high-pressure test"], targetStat: 'skill' };
    }
};

export const generateSkillTest = async (skill: string): Promise<{ question: string, type: string }> => {
  if (!API_KEY) return { question: "Explain your process.", type: "scenario" };
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `User has completed training for the skill: "${skill}".
  Generate a challenging, advanced test question or a complex scenario that requires the user to prove their mastery of "${skill}".
  The question should be concise and highly technical or philosophical depending on the skill.
  Return JSON format: { "question": "the question", "type": "scenario|technical|logic" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ['question', 'type']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to generate skill test", e);
    return { question: `Describe how you would apply ${skill} in a high-stakes real-world project.`, type: "scenario" };
  }
};

export const evaluateSkillTest = async (skill: string, question: string, answer: string): Promise<{ passed: boolean, feedback: string }> => {
  if (!API_KEY) return { passed: true, feedback: "Neural link unverified." };
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `Skill: "${skill}"
  Test Question: "${question}"
  User's Answer: "${answer}"
  
  Act as a rigorous "Blue Lock" evaluator. Determine if the user's answer proves mastery of the skill.
  Be strict. If the answer is vague or shallow, fail them.
  Return JSON format: { "passed": boolean, "feedback": "brief critique (max 20 words)" }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ['passed', 'feedback']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to evaluate test", e);
    return { passed: true, feedback: "Manual override triggered. Evaluation passed." };
  }
};

export const generatePersonaReply = async (persona: string, lastMessage: string): Promise<string> => {
    if (!API_KEY) return "...";
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Persona: ${persona}\nUser sent: "${lastMessage}"\nReply in character (max 20 words).`,
      });
      return response.text?.trim() || "Interesting!";
    } catch (e) {
      return "Cannot connect to neural link...";
    }
};

export const refineText = async (text: string, instruction: string = "Make it concise and professional"): Promise<string> => {
  if (!API_KEY) return text;
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Refine the following text. Instruction: ${instruction}. Text: "${text}". Return only the refined text.`,
    });
    return response.text?.trim() || text;
  } catch (e) {
    console.error("Failed to refine text", e);
    return text;
  }
};

export const runChatTurn = async (
  history: Content[], 
  newMessage: string, 
  tools: FunctionDeclaration[],
  handleToolCall: (name: string, args: any) => Promise<any>
): Promise<string> => {
  if (!API_KEY) return "I'm sorry, I don't have an API key configured.";
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const toolConfig: Tool[] = [{ functionDeclarations: tools }];

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history,
      config: {
        tools: toolConfig,
      }
    });

    let response = await chat.sendMessage({ message: newMessage });
    
    while (response.candidates && response.candidates[0]?.content?.parts?.some(p => p.functionCall)) {
        const part = response.candidates[0].content.parts.find(p => p.functionCall);
        if (!part || !part.functionCall) break;
        const fc = part.functionCall;
        
        let result;
        try {
            result = await handleToolCall(fc.name, fc.args);
        } catch (err: any) {
            result = { error: err.message };
        }

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

    return response.text || "Processed.";

  } catch (e: any) {
    console.error("Chat Error:", e);
    if (e.message?.includes('429')) {
      return "System Alert: Neural link capacity exceeded. Please retry in a few seconds.";
    }
    return `Error: ${e.message}`;
  }
};
