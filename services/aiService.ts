import { GoogleGenAI, Type } from "@google/genai";
import { Task, DailyAnalysis, Priority, TaskStatus, AIParseResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseNaturalLanguageTask = async (input: string): Promise<AIParseResult[]> => {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Current System Date: ${todayStr} (${dayName}).
      User Input: "${input}".
      
      Instructions:
      1. Extract task details.
      2. INTELLIGENT DATE PARSING:
         - If user says "Tomorrow", calculate date.
         - If user says "Saturday to Wednesday", generate a separate task entry for EACH day (Sat, Sun, Mon, Tue, Wed) with the correct YYYY-MM-DD date.
         - If no date is specified, use Today (${todayStr}).
         - Start times should be in 24h format (HH:mm).
      3. Translate context to categories: Work, Health, Learning, Personal, Errand.
      4. Return an ARRAY of tasks.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short concise title" },
              description: { type: Type.STRING, description: "Detailed description" },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
              startTime: { type: Type.STRING, description: "HH:mm format (24h) or null/undefined" },
              durationMinutes: { type: Type.INTEGER, description: "Duration in minutes" },
              priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
              category: { type: Type.STRING, description: "One word category" }
            },
            required: ["title", "date", "durationMinutes", "priority", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    // Ensure it's an array
    const results = Array.isArray(parsed) ? parsed : [parsed];
    
    return results.map((item: any) => ({
      title: item.title,
      description: item.description || "",
      date: item.date || todayStr,
      startTime: item.startTime || undefined,
      durationMinutes: item.durationMinutes || 30,
      priority: item.priority as Priority,
      category: item.category
    }));
  } catch (error) {
    console.error("AI Parse Error:", error);
    // Fallback
    return [{
      title: input,
      description: "",
      date: todayStr,
      startTime: undefined,
      durationMinutes: 30,
      priority: Priority.MEDIUM,
      category: "General"
    }];
  }
};

export const analyzeDailyProductivity = async (tasks: Task[]): Promise<DailyAnalysis> => {
  // Prepare data for AI
  const taskSummary = tasks.map(t => ({
    title: t.title,
    category: t.category,
    status: t.status,
    duration: t.durationMinutes,
    priority: t.priority
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this daily log of tasks and provide productivity insights in Persian (Farsi).
      Tasks: ${JSON.stringify(taskSummary)}
      
      Calculate a productivity score (0-100).
      Identify category distribution for the chart.
      Give 3 short, punchy insights about their habits.
      Give 2 actionable suggestions for tomorrow.
      Pick a mood emoji representing the day.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productivityScore: { type: Type.INTEGER },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            moodEmoji: { type: Type.STRING },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if(!text) throw new Error("Empty analysis response");
    const data = JSON.parse(text);

    return {
      date: new Date().toISOString(),
      ...data
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      date: new Date().toISOString(),
      productivityScore: 50,
      insights: ["ارتباط با هوش مصنوعی برقرار نشد."],
      suggestions: ["لطفا اتصال اینترنت خود را بررسی کنید."],
      moodEmoji: "😐",
      chartData: []
    };
  }
};