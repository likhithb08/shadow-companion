import { useCallback, useMemo } from 'react';
import { FunctionDeclaration, Type } from '@google/genai';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { generateAIUpdates } from '../services/gemini';

export const useGeminiTools = () => {
  const { addTask, updateTask, tasks, deleteTask, updatePreferences, workflows, addWorkflow } = useApp();
  const navigate = useNavigate();

  // --- Definitions ---
  const tools: FunctionDeclaration[] = useMemo(() => [
    {
      name: 'navigate',
      description: 'Navigate the user to a specific screen in the application. Use this when the user asks to go somewhere or see something specific.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          screen: {
            type: Type.STRING,
            description: 'The screen to navigate to. Options: "companion" (home), "feed", "updates", "productivity", "automation"',
            enum: ['companion', 'feed', 'updates', 'productivity', 'automation']
          }
        },
        required: ['screen']
      }
    },
    {
      name: 'addTask',
      description: 'Create a NEW task in the users productivity list. Use this ONLY for creating new items. Ask for the task title if not provided.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The content or title of the task to be done.'
          },
          category: {
            type: Type.STRING,
            description: 'The category of the task (e.g., Work, Personal, Health, Study). Defaults to General.',
          }
        },
        required: ['title']
      }
    },
    {
      name: 'manageTask',
      description: 'Modify an EXISTING task. Use this to delete, mark complete/incomplete, or update the text/category of a task based on the users voice command.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          searchPhrase: {
            type: Type.STRING,
            description: 'The phrase to identify the task (e.g. "grocery", "gym", "report").'
          },
          action: {
            type: Type.STRING,
            enum: ['mark_complete', 'mark_pending', 'delete', 'update'],
            description: 'The action to perform.'
          },
          newTitle: { 
            type: Type.STRING, 
            description: 'The new text for the task (only required if action is "update" and title is changing).' 
          },
          newCategory: { 
            type: Type.STRING, 
            description: 'The new category for the task (only required if action is "update" and category is changing).' 
          }
        },
        required: ['searchPhrase', 'action']
      }
    },
    {
      name: 'getTasks',
      description: 'Get the current list of tasks. Use this when the user asks "what do I have to do?", "read my tasks", or before modifying a task to ensure it exists.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      }
    },
    {
        name: 'getAIUpdates',
        description: 'Fetch the latest AI news and updates. Returns titles, summaries, and full detailed content. Use this when the user asks for news. You can choose to read the summary or the full "content" based on the users specific request.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        }
    },
    {
        name: 'createWorkflow',
        description: 'Create a new automation workflow agent.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ['title', 'description']
        }
    },
    {
        name: 'getWorkflows',
        description: 'Get the list of current automation workflows.',
        parameters: {
            type: Type.OBJECT,
            properties: {}
        }
    },
    {
      name: 'changeVoice',
      description: 'Change the voice of the AI companion. Use this when the user asks to change the voice (e.g., "be female", "deeper voice").',
      parameters: {
        type: Type.OBJECT,
        properties: {
          voiceName: {
            type: Type.STRING,
            description: 'The voice to switch to. Options: "Puck" (Male), "Charon" (Deep Male), "Kore" (Female), "Fenrir" (Energetic Male), "Zephyr" (Calm Female).',
            enum: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr']
          }
        },
        required: ['voiceName']
      }
    }
  ], []);

  // --- Execution Logic ---
  const handleToolCall = useCallback(async (name: string, args: any): Promise<any> => {
    console.log(`Executing tool: ${name}`, args);
    
    switch (name) {
      case 'navigate': {
        const { screen } = args;
        const path = screen === 'companion' ? '/' : `/${screen}`;
        navigate(path);
        return { result: `Navigated to ${screen}` };
      }
      
      case 'addTask': {
        const { title, category } = args;
        addTask(title, category || "General");
        return { result: `Added task "${title}" to category ${category || "General"}` };
      }
      
      case 'manageTask': {
        const { action, searchPhrase, newTitle, newCategory } = args;
        // Case insensitive search
        const task = tasks.find(t => t.text.toLowerCase().includes(searchPhrase.toLowerCase()));
        
        if (task) {
          if (action === 'mark_complete') {
            updateTask(task.id, { completed: true });
            return { result: `Task "${task.text}" marked as Completed` };
          } 
          else if (action === 'mark_pending') {
            updateTask(task.id, { completed: false });
            return { result: `Task "${task.text}" marked as Pending` };
          }
          else if (action === 'delete') {
            deleteTask(task.id);
            return { result: `Task "${task.text}" deleted` };
          }
          else if (action === 'update') {
            const updates: any = {};
            if (newTitle) updates.text = newTitle;
            if (newCategory) updates.category = newCategory;
            
            if (Object.keys(updates).length === 0) {
                return { result: "No changes provided for update." };
            }
            
            updateTask(task.id, updates);
            return { result: `Updated task "${task.text}". New details: ${newTitle || task.text} (${newCategory || task.category})` };
          }
        } 
        return { result: `Error: Could not find a task matching "${searchPhrase}". Please check the task list.` };
      }
      
      case 'getTasks': {
        const taskList = tasks.map(t => `- ${t.text} (${t.completed ? 'Done' : 'Pending'}, ${t.category})`).join('\n');
        return { result: taskList || "No tasks found." };
      }

      case 'getAIUpdates': {
         const updates = await generateAIUpdates();
         // Return full object so model can access summary or content
         return { result: JSON.stringify(updates) };
      }

      case 'createWorkflow': {
          const { title, description } = args;
          addWorkflow(title, description);
          return { result: `Created workflow "${title}"` };
      }

      case 'getWorkflows': {
          const wfList = workflows.map(w => `- ${w.title} (${w.status})`).join('\n');
          return { result: wfList || "No workflows found." };
      }
      
      case 'changeVoice': {
        const { voiceName } = args;
        updatePreferences({ voiceName });
        return { result: `Voice changed to ${voiceName}. Reconnecting...` };
      }
      
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }, [addTask, deleteTask, updateTask, navigate, tasks, updatePreferences, workflows, addWorkflow]);

  return { tools, handleToolCall };
};