# Clarity Project Overview

## Vision
Build a warm, intuitive planning tool for individuals with ADHD that helps them go from mental chaos to clear, structured days — through mind-dumping, intelligent task structuring, and gentle, actionable nudges.

## Problem Statement
Individuals with ADHD often struggle with:
*   Overwhelming and scattered thoughts, especially at the start of the day.
*   Difficulty prioritising and structuring tasks.
*   Forgetting important tasks due to distractions.
*   Struggling to break large goals into smaller, manageable steps.

## Proposed Solution
"Clarity" — an intuitive mind-dump and planning tool designed specifically for people with ADHD, providing structure, clarity, and peace of mind throughout their daily lives.

## Core Features (From Spec)
1.  **Mind Dump & Thought Collection:**
    *   A clean, distraction-free input space.
    *   AI-assisted automatic categorisation (tasks, events, emotions, ideas, notes).
    *   Thoughts are intelligently tagged and grouped by: Task, Event, Idea, Feeling/Emotion, Note.
2.  **Structured Task Management:**
    *   Easy task creation and hierarchical nesting (Yearly → Monthly → Weekly → Daily → Hourly).
    *   Quick prioritisation prompts powered by AI.
3.  **Visual Planning & Time-Boxing:**
    *   Intuitive drag-and-drop scheduling interface.
    *   Zoomable timelines to switch between detailed and high-level views.
4.  **Smart Reminders:**
    *   Gentle, customisable nudges and notifications.
    *   Context-aware alerts (time of day, upcoming tasks, energy levels).
5.  **ADHD-Friendly Interface:**
    *   Minimalist, calming design with low sensory load.
    *   Personalised themes and visual simplicity.

## Technical Approach
*   **Frontend:** React (Currently using Next.js)
*   **Backend/API:** Python (FastAPI or Django) specified, but currently implemented using Next.js API Routes for PoC.
*   **AI/NLP:** GPT-4 or similar service (Currently using Google Gemini via API).
*   **Database:** PostgreSQL or MongoDB (Not implemented in PoC).
*   **Cross-platform:** Start as a web app with potential for mobile.

## Product Roadmap

### Phase 1: Foundation & Proof of Concept (Weeks 1–4)
*   **Core Features:**
    *   Mind Dump Input
    *   AI Categorization (Task, Event, Idea, Feeling, Note)
    *   Organized View (Grouped by category)
    *   Simple Daily Planner (Time-boxing)
    *   Simulated Reminders
*   **Tech Setup:**
    *   Next.js Frontend & API Routes
    *   Google Gemini Integration
*   **UI Polish:**
    *   Basic light and dark mode styling implemented.

### Phase 2: Daily Use & Personal Structure (Weeks 5–8) - CURRENT PHASE
*   **Enhanced Planning:**
    *   Editable tags/categories. *(Implemented 2025-04-05)*
    *   Basic task prioritization (manual or simple AI).
    *   Weekly view toggle.
*   **Smart Reminders:**
    *   More robust reminder system (beyond simple alerts).
    *   Customizable reminder timings/sounds.
*   **Early Reflection:**
    *   Simple daily summary/export.

### Phase 3: Goal Hierarchy & Broader Planning (Weeks 9–12)
*   **Zoomable Goal Layers:**
    *   Introduce hierarchical planning (e.g., Monthly > Weekly > Daily).
    *   Visual timeline improvements.
*   **Intelligent Support:**
    *   AI-powered task breakdown suggestions.
    *   AI-driven prioritization assistance.

### Phase 4: Persistence & Portability (Weeks 13–16)
*   **Data & Sync:**
    *   User accounts and authentication.
    *   Database integration for persistence.
    *   Cloud sync.
*   **Mobile Access:**
    *   Develop basic mobile web or PWA version.

### Phase 5: Gamification & Community (Stretch Goals)
*   **Motivation Layer:**
    *   Streaks, points, or other gentle gamification.
    *   Progress tracking visuals.
*   **User Engagement:**
    *   Optional sharing features.
    *   Community forum/support.

## User Validation Strategy
*   Feedback sessions with 10–15 users from ADHD communities.
*   Collect and iterate based on real usage pain points.
*   Focus on clarity, ease of use, and comfort.

## Success Criteria
*   Users report increased clarity and focus.
*   High engagement and return usage.
*   Positive feedback on emotional comfort and simplicity.

## Future Roadmap (Beyond Phase 5)
*   Integration with external tools (Google Calendar, Todoist).
*   Native mobile app.
*   More intelligent, personalised AI nudging.
