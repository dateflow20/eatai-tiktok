
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserSettings, MessageContext, Suggestion, SocialReview } from "../types";

// Always access API key via process.env.API_KEY directly to ensure the most up-to-date instance.

export const refineSituation = async (rawInput: string): Promise<{ situation: string, goal: string }> => {
  // Initialize right before usage to ensure current environment context is captured
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `The user provided this raw explanation of their situation: "${rawInput}". 
    DISTILL this into:
    1. A strategic "Situation" (The background tension, context, and current state).
    2. A sharp "Goal" (What they want to achieve in this specific chat).
    Output JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situation: { type: Type.STRING },
          goal: { type: Type.STRING }
        },
        required: ["situation", "goal"]
      }
    }
  });
  // Use .text directly as it is a getter, not a method
  return JSON.parse(response.text || "{}");
};

const callOpenRouter = async (prompt: string, systemInstruction: string, schema: any) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat",
        "messages": [
          { "role": "system", "content": systemInstruction },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("OpenRouter Fallback Error:", error);
    throw error;
  }
};

export const generateReplies = async (
  settings: UserSettings,
  context: MessageContext
): Promise<Suggestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const threadText = context.thread
    .map(m => `${m.sender === 'me' ? 'Me' : 'Them'}: ${m.text}`)
    .join('\n');

  const systemInstruction = `
    You are "Reply", a world-class Social Architect and Human Emulation layer. 
    Your mission: Generate the perfect text response.

    HUMANITY & STYLE RULES:
    1. LOWERCASE: Use all lowercase for a relaxed, authentic feel, especially if Slang level is high (${settings.humanity}%).
    2. ABBREVIATIONS: Use "u" for "you", "r" for "are", "fr" for "for real", "rn" for "right now", "tbh", "ngl", "lol", "dw", "idk".
    3. EMOJI INTELLIGENCE: Place emojis where they add subtext (e.g., 💀, 😭, 💅, 🫠). 
    4. BREVITY: Matching word count is key. 12 words MAX.
    5. STORY PROGRESSION: Use Phase system (Rapport, Escalation, Pivot, Closer).
    
    You are a world-class social intelligence agent. Your goal is to help the user achieve "social victory" by providing the most effective, high-status, and engaging replies.

LINGUISTIC INTELLIGENCE:
- DEFAULT: Always respond in English unless the user uses another language.
- LUGANDA/UGLISH: You are fluent in Ugandan English (Uglish) and Luganda. ONLY use Luganda or heavy Uglish slang if the user initiates it or if the context clearly suggests it's appropriate (e.g., the user is chatting with someone from Uganda and uses Luganda words).
- ADAPTABILITY: Be smart. Detect the user's linguistic style, dialect, and slang. Match their energy and language choice naturally. If they mix languages, you can mix them too.
- MULTILINGUAL: You support multiple languages and should respond in the language the user is using.
    
    CONTEXT:
    Situation: ${settings.situation}
    Goal: ${settings.goal}
    Relationship: ${settings.relationship}
    Requested Vibe: ${settings.currentVibe}
  `;

  const prompt = `
    LAST MESSAGE FROM THEM: ${context.thread.length > 0 && context.thread[context.thread.length - 1].sender === 'them' ? context.thread[context.thread.length - 1].text : 'n/a'}
    THREAD:
    ${threadText || 'Start the convo.'}

    Generate 10 strategic next moves in JSON. If the conversation has Luganda, ensure the suggestions reflect that.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The actual text to send" },
              vibe: { type: Type.STRING },
              strategy: { type: Type.STRING, description: "Why we are saying this" },
              phase: {
                type: Type.STRING,
                enum: ['Rapport', 'Escalation', 'Pivot', 'Closer', 'Checkpoint']
              },
              isMeta: { type: Type.BOOLEAN }
            },
            required: ["text", "vibe", "strategy", "phase", "isMeta"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((item: any, index: number) => ({
      id: `suggestion-${index}-${Date.now()}`,
      ...item,
      rating: 0
    }));
  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Fallback to OpenRouter if Gemini fails (e.g. 429, 500)
    if (process.env.OPENROUTER_API_KEY) {
      console.log("Falling back to OpenRouter...");
      try {
        const result = await callOpenRouter(prompt, systemInstruction, null);
        return result.map((item: any, index: number) => ({
          id: `suggestion-${index}-${Date.now()}`,
          ...item,
          rating: 0
        }));
      } catch (orError) {
        console.error("OpenRouter also failed:", orError);
        throw error; // Throw original error if fallback fails
      }
    }
    throw error;
  }
};

export const generateSocialReview = async (
  settings: UserSettings,
  context: MessageContext
): Promise<SocialReview> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const threadText = context.thread
    .map(m => `${m.sender === 'me' ? 'Me' : 'Them'}: ${m.text}`)
    .join('\n');

  const prompt = `
    Review the conversation architecture.
    Situation: "${settings.situation}"
    Goal: "${settings.goal}".
    History:
    ${threadText}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      systemInstruction: "Analyze dialogue velocity and social distance. Output JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          syncScore: { type: Type.NUMBER },
          mood: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          strategicAdvice: { type: Type.STRING },
          relationshipStatus: { type: Type.STRING }
        },
        required: ["syncScore", "mood", "highlights", "strategicAdvice", "relationshipStatus"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as SocialReview;
  } catch (e) {
    console.error("Review parse error", e);
    throw e;
  }
};

export const generateTTS = async (text: string, vibe: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const voice = vibe.toLowerCase().includes('flirty') || vibe.toLowerCase().includes('romantic') ? 'Kore' : 'Zephyr';

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ parts: [{ text: `Say naturally in a ${vibe} vibe: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

export function decodeAudio(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
