import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import type { Entry } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface AIEntry {
  text: string;
  type: string;
  priority: number;
  startTime?: string;
  endTime?: string;
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text input' },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const now = new Date();
    const currentDateISO = now.toISOString();

    const prompt = `Analyze the following text dump from a user. Current date and time for context is ${currentDateISO}.
1. Categorize each distinct thought or item into one: 'task', 'event', 'idea', 'feeling', 'note'.
2. For 'task' or 'event', assign a numerical priority (1=Morning, 2=Midday, 3=Afternoon, 4=Evening, 5=Anytime/Flexible) based on time mentions or logical sequence. For others, assign priority 5.
3. **Crucially:** For 'task' or 'event', if a specific date, relative date (e.g., 'tomorrow', 'next Tuesday'), time, or duration (e.g., '2pm-3pm', 'for 1 hour') is mentioned, extract it.
    - Return an estimated "startTime" in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ).
    - If only a date is mentioned, default the time part of "startTime" to 00:00:00 for that date.
    - If an end time or duration is clearly mentioned, also return an estimated "endTime" in ISO 8601 format. Ensure endTime is after startTime.
    - If no time/date is found, omit "startTime" and "endTime".
4. Structure the output as a VALID JSON object with a single key "entries", which is an array of objects. Each object must have "text", "type", and "priority". Include "startTime" and "endTime" ONLY if extracted. Do not include any other text or markdown formatting outside the JSON object.

Text dump:
---
${text}
---

JSON Output:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
    });

    if (!result.response) {
      console.error('AI response blocked due to safety settings or other issue.');
      return NextResponse.json(
        { error: 'AI response blocked or unavailable.' },
        { status: 500 },
      );
    }

    const response = result.response;
    const aiResponseText = response.text();

    let structuredResponse: { entries: AIEntry[] };
    try {
      const jsonStart = aiResponseText.indexOf('{');
      const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = aiResponseText.substring(jsonStart, jsonEnd);
        structuredResponse = JSON.parse(jsonString);
      } else {
        structuredResponse = JSON.parse(aiResponseText);
      }

      if (!structuredResponse || !Array.isArray(structuredResponse.entries) || structuredResponse.entries.some((entry: Partial<AIEntry>) => typeof entry.text !== 'string' || typeof entry.type !== 'string' || typeof entry.priority !== 'number')) {
         console.error('AI response missing required fields (text, type, priority):', structuredResponse);
         throw new Error('AI response format incorrect - missing required fields.');
      }
      structuredResponse.entries.forEach((entry: Partial<AIEntry>) => {
        if (entry.startTime && isNaN(Date.parse(entry.startTime))) {
          console.warn(`Invalid startTime format received from AI: ${entry.startTime}`);
          entry.startTime = undefined;
        }
        if (entry.endTime && isNaN(Date.parse(entry.endTime))) {
          console.warn(`Invalid endTime format received from AI: ${entry.endTime}`);
          entry.endTime = undefined;
        }
        if (entry.startTime && entry.endTime && Date.parse(entry.endTime) <= Date.parse(entry.startTime)) {
           console.warn(`endTime (${entry.endTime}) is not after startTime (${entry.startTime}). Discarding endTime.`);
           entry.endTime = undefined;
        }
      });


    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response or response format incorrect' },
        { status: 500 },
      );
    }

    const finalEntries: Entry[] = structuredResponse.entries.map((aiEntry: Partial<AIEntry>) => ({
      text: aiEntry.text!,
      type: aiEntry.type!,
      priority: aiEntry.priority!,
      startTime: aiEntry.startTime,
      endTime: aiEntry.endTime,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({ entries: finalEntries });

  } catch (error) {
    console.error('Error in /api/categorise:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
