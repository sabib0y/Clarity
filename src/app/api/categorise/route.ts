import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Access your API key as an environment variable
// Ensure you have GOOGLE_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Define expected entry structure outside the function for clarity
interface AIEntry {
  text: string;
  type: string;
  priority: number;
}

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

    // For text-only input, try the latest flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Updated prompt to request priority
    const prompt = `Analyze the following text dump from a user. Categorize each distinct thought or item into one of the following types: 'task', 'event', 'idea', 'feeling', or 'note'.
For each item categorized as 'task' or 'event', also determine a likely priority based on typical daily schedules or logical sequence. Assign a numerical priority: 1 for morning, 2 for midday, 3 for afternoon, 4 for evening, 5 for anytime/flexible. For other types ('idea', 'feeling', 'note'), assign priority 5.
Structure the output as a JSON object with a single key "entries", which is an array of objects. Each object in the array must have a "text" key with the original text snippet, a "type" key with its determined category, and a "priority" key with the assigned numerical priority (1-5). Ensure the output is valid JSON.

Text dump:
---
${text}
---

JSON Output:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = response.text();

    // Basic parsing attempt (might need refinement based on actual API output)
    let structuredResponse: { entries: AIEntry[] }; // Type the expected response structure
    try {
      // Find the start of the JSON block
      const jsonStart = aiResponseText.indexOf('{');
      const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = aiResponseText.substring(jsonStart, jsonEnd);
        structuredResponse = JSON.parse(jsonString);
      } else {
        // Attempt to handle cases where the response might not be wrapped in ```json ... ```
        structuredResponse = JSON.parse(aiResponseText);
      }

      // Add basic validation for the new structure using the defined interface
      if (!structuredResponse || !Array.isArray(structuredResponse.entries) || structuredResponse.entries.some((entry: AIEntry) => typeof entry.priority !== 'number')) {
         console.error('AI response missing expected priority field:', structuredResponse);
         throw new Error('AI response format incorrect - missing priority.');
      }

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response or response format incorrect' },
        { status: 500 },
      );
    }

    return NextResponse.json(structuredResponse);
  } catch (error) {
    console.error('Error in /api/categorise:', error);
    // Provide more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
