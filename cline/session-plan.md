# Session Plan: Start/End Times & Detail View Refactor (2025-04-05 v2)

## Goal
Refactor the application to use distinct `startTime` and `endTime` fields instead of a single `eventTimestamp`. Update the entry detail page to allow setting these times and refactor the Daily Planner accordingly. Continue using global state management.

## Implementation Steps (Revised for Start/End Times)

1.  **Data Structure (`Entry` type):**
    *   **Location:** `src/types/index.ts`
    *   **Fields to Add/Ensure:**
        *   `id: string` (Primary key)
        *   `text: string` (Entry title)
        *   `type: string` (Category: task, event, etc.)
        *   `priority: number` (Time-based priority)
        *   `note?: string` (User-added notes)
        *   `createdAt: string` (ISO timestamp - when categorized)
        *   `startTime?: string` (Optional ISO timestamp - START time)
        *   `endTime?: string` (Optional ISO timestamp - END time)
    *   **Status:** [X] Done

2.  **API (`/api/categorise`):**
    *   **Location:** `src/app/api/categorise/route.ts`
    *   **Modification:** Ensure the API response includes `createdAt: new Date().toISOString()` for each categorized entry.
    *   **(Optional Stretch):** No changes needed here for start/end time parsing initially.
    *   **Status:** [X] Done (No change required for this step)

3.  **Global State (React Context API):**
    *   **Location:** `src/context/EntriesContext.tsx`.
    *   **Provider:** Wrap the application layout (`src/app/layout.tsx`) with the `EntriesProvider`.
    *   **Value:** The context should provide:
        *   `categorizedEntries: Entry[]`
        *   `handleCategorise(data: CategoriseResponse)`
        *   `handleUpdateCategory(itemId: string, newCategory: string)`
        *   `handleUpdateNote(itemId: string, newNote: string)`
        *   `handleUpdateTitle(itemId: string, newTitle: string)`
        *   `handleUpdateStartTime(itemId: string, newTimestamp: string | null)` (Replaces eventTimestamp handler)
        *   `handleUpdateEndTime(itemId: string, newTimestamp: string | null)` (New handler)
    *   **Refactor `page.tsx`:** Already done.
    *   **Status:** [X] Done

4.  **Routing:**
    *   **Action:** Create/verify dynamic route for entry details.
    *   **Location:** `src/app/entry/[id]/page.tsx`
    *   **Status:** [X] Done (Route exists)

5.  **Entry Detail Page Component:**
    *   **Location:** `src/app/entry/[id]/page.tsx`
    *   **Functionality:**
        *   Consume `EntriesContext`.
        *   Get `id` from route parameters.
        *   Find and display the specific entry's details (`text`, `type`, `createdAt`).
        *   Display and allow editing of the `note` via a textarea, calling `handleUpdateNote`.
        *   Allow editing of the title (`text`), calling `handleUpdateTitle`.
        *   Allow changing the category (`type`), calling `handleUpdateCategory`.
        *   Add date/time inputs for `startTime` and `endTime`, calling respective handlers.
        *   Include a "Back" navigation link/button.
    *   **Status:** [X] Done

6.  **Update `OrganizedView.tsx`:**
    *   **Location:** `src/components/OrganizedView.tsx`
    *   **Modification:**
        *   Remove inline editing icons and logic (pencil, category dropdown).
        *   Wrap each list item with `<Link href={'/entry/${entry.id}'}>`.
        *   Add note icon indicator.
    *   **Status:** [X] Done (No change required for this step)

7.  **Refactor `DailyPlanner.tsx`:**
    *   **Location:** `src/components/DailyPlanner.tsx`
    *   **Modification:**
        *   Consume `EntriesContext` instead of props.
        *   Filter tasks from context.
        *   Display `startTime` and potentially `endTime` or duration.
        *   Remove direct time editing input (or link to detail page).
    *   **Status:** [X] Done

## Testing Plan (Revised for Start/End Times)

1.  **API Test:**
    *   Send a POST request to `/api/categorise`.
    *   **Verify:** Response includes `id` and `createdAt` field.
    *   **Status:** [X] Done (Verified previously)

2.  **Global State Test:**
    *   Add entries via Mind Dump on the main page.
    *   Navigate to the detail page for one entry.
    *   **Verify:** The detail page correctly displays the data for that specific entry fetched from the global context.
    *   **Status:** [X] Done (Verified previously)

3.  **Entry Detail Page - Display:**
    *   Navigate to an entry detail page.
    *   **Verify:** Title, category, creation time are displayed correctly.
    *   **Verify:** Start/End time inputs are shown for tasks/events.
    *   **Verify:** Note textarea is displayed.
    *   **Status:** [X] Done (Verified 2025-04-05)

4.  **Entry Detail Page - Start/End Time:**
    *   Navigate to a task/event detail page.
    *   Set a future `startTime` using the input.
    *   Set an optional `endTime` (after `startTime`).
    *   **Verify:** `startTime` and `endTime` are updated in context (check Daily Planner display).
    *   Clear the `startTime`.
    *   **Verify:** `startTime` and `endTime` are cleared/reset.
    *   **Status:** [X] Done (Verified 2025-04-05)

5.  **Entry Detail Page - Note Editing:**
    *   Navigate to an entry detail page.
    *   Add or modify text in the notes textarea.
    *   Navigate back to the main page and then back to the detail page.
    *   **Verify:** The note changes are persisted in the global state and displayed correctly on reload/re-navigation.
    *   **Status:** [X] Done (Verified previously)

6.  **Entry Detail Page - Title Editing:**
    *   Navigate to an entry detail page.
    *   Trigger title editing and change the title.
    *   Navigate back to the main page.
    *   **Verify:** The updated title is reflected in the `OrganizedView` list on the main page.
    *   **Verify:** The updated title is shown when navigating back to the detail page.
    *   **Status:** [X] Done (Verified previously)

7.  **Entry Detail Page - Category Editing:**
    *   Navigate to an entry detail page.
    *   Trigger category editing and select a new category.
    *   Navigate back to the main page.
    *   **Verify:** The entry appears under the new category group in `OrganizedView`.
    *   **Verify:** The updated category is shown when navigating back to the detail page.
    *   **Status:** [X] Done (Verified previously)

8.  **Navigation Test:**
    *   Click an entry in `OrganizedView`.
    *   **Verify:** Correct detail page (`/entry/[id]`) loads.
    *   Click the "Back" button on the detail page.
    *   **Verify:** User is returned to the main page (`/`).
    *   **Status:** [X] Done (Verified previously)

9.  **Daily Planner Sync Test:**
    *   Set a `startTime` and optional `endTime` for a task on its detail page.
    *   Navigate back to the main page.
    *   **Verify:** The corresponding task in the Daily Planner displays the correct start/end time or duration.
    *   (If editing is implemented in Planner): Change the time in the Daily Planner.
    *   (If editing is implemented in Planner): Navigate to the detail page for that task.
    *   (If editing is implemented in Planner): **Verify:** The detail page shows the updated time.
    *   **Status:** [X] Done (Verified 2025-04-05)

10. **Regression Test:**
    *   **Verify:** Mind Dump input still works correctly.
    *   **Verify:** Organized View grouping, note icons, and links work.
    *   **Verify:** Daily Planner grouping and drag/drop (within limits of TODOs) work.
    *   **Status:** [X] Done (Verified 2025-04-05)

## Outstanding Phase 2 Tasks (From Roadmap)
*   [X] Basic task prioritization (manual drag-and-drop implemented).
*   [X] Planner View & Filtering: *(Marked complete 2025-04-06)*
    *   [X] Add state for active view ('list' | 'calendar') and time filter ('day' | 'week' | 'month' | 'year' | 'all').
    *   [X] Implement UI tabs for "List View" / "Calendar".
    *   [X] Implement conditional rendering based on active view.
    *   [X] Implement time filter buttons (DAY, WEEK, MONTH, YEAR, ALL) within List View.
    *   [X] Implement filtering logic in `useMemo` based on selected time filter (always show unscheduled).
    *   [X] Update tests for view tabs, time filters, and filtering logic.
    *   [X] Implement Calendar View component (Implemented using `react-calendar` within Daily Planner tabs).
