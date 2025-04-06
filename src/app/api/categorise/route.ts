import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'; // Import safety settings types
import { NextResponse } from 'next/server';
import type { Entry } from '@/types'; // Import the full Entry type

// Access your API key as an environment variable
// Ensure you have GOOGLE_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Define expected entry structure outside the function for clarity
interface AIEntry {
  text: string;
  type: string;
  priority: number; // Priority assigned by AI
}

// Define the safety settings
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

    // For text-only input, try the latest flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // Updated prompt to request priority
    const prompt = `Analyze the following text dump from a user. Categorize each distinct thought or item into one of the following types: 'task', 'event', 'idea', 'feeling', or 'note'.
For each item categorized as 'task' or 'event', also determine a likely priority based on typical daily schedules or logical sequence. Assign a numerical priority: 1 for morning, 2 for midday, 3 for afternoon, 4 for evening, 5 for anytime/flexible. For other types ('idea', 'feeling', 'note'), assign priority 5.
Structure the output as a JSON object with a single key "entries", which is an array of objects. Each object in the array must have a "text" key (the original thought/item), a "type" key (the category: 'task', 'event', 'idea', 'feeling', or 'note'), and a "priority" key (the numerical priority 1-5). Ensure the output is valid JSON. Do not include any other explanatory text or markdown formatting outside the JSON object.

Text dump:
---
${text}
---

JSON Output:`;

    // Generate content with safety settings
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
      // Optional: Add generationConfig if needed
      // generationConfig: { temperature: 0.7 }
    });

    // Handle potential safety blocks
    if (!result.response) {
      console.error('AI response blocked due to safety settings or other issue.');
      // You might want to inspect result.response.promptFeedback here
      return NextResponse.json(
        { error: 'AI response blocked or unavailable.' },
        { status: 500 },
      );
    }

    const response = result.response;
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
      console.error('Raw AI response:', aiResponseText); // Log the raw response for debugging
      return NextResponse.json(
        { error: 'Failed to parse AI response or response format incorrect' },
        { status: 500 },
      );
    }

    // Map the AI response to the full Entry structure, adding id and createdAt
    const finalEntries: Entry[] = structuredResponse.entries.map((aiEntry) => ({
      ...aiEntry, // Spread the text, type, priority from AI
      id: crypto.randomUUID(), // Generate a unique ID
      createdAt: new Date().toISOString(), // Add the creation timestamp
      // note and eventTimestamp will be undefined initially
    }));

    // Return the final structure
    return NextResponse.json({ entries: finalEntries });

  } catch (error) {
    console.error('Error in /api/categorise:', error); // Log the full error
    // Provide more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
