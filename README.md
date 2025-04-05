# Clarity - ADHD Planning Tool PoC

This is a [Next.js](https://nextjs.org) project serving as a Proof of Concept (PoC) for "Clarity", a warm, intuitive planning tool designed for individuals with ADHD.

The goal is to help users go from mental chaos to clear, structured days through mind-dumping, intelligent task structuring (using AI), and visual planning.

This PoC implements the core features of Phase 1:
*   Mind Dump Input
*   AI Categorization (Task, Event, Idea, Feeling, Note) with Priority
*   Organized View (Grouped by category)
*   Simple Daily Planner (Grouped by priority, basic time-boxing, drag-and-drop)

## Getting Started

### Prerequisites

1.  **Node.js and npm:** Ensure you have Node.js (which includes npm) installed.
2.  **Google API Key:** You need an API key for Google Generative AI (Gemini).
    *   Obtain your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Create a file named `.env.local` in the project root directory.
    *   Add your API key to the `.env.local` file like this:
        ```
        GOOGLE_API_KEY=YOUR_API_KEY_HERE
        ```

### Installation

1.  Clone the repository (if you haven't already).
2.  Navigate to the project directory in your terminal.
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The page auto-updates as you edit files in the `src` directory.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).
