'use client'; // Convert to Client Component

import React from 'react'; // Removed useState import
import { useEntries } from '@/context/EntriesContext'; // Import the custom hook
// Removed unused Entry import: import type { Entry } from '@/types';

import DailyPlanner from '@/components/DailyPlanner';
import MindDumpInput from '@/components/MindDumpInput';
import OrganizedView from '@/components/OrganizedView';
// Removed AgendaView import as it will be handled within DailyPlanner

// Type definitions like Entry and CategoriseResponse are now likely defined globally or in types/index.ts

export default function ClarityPage() {
  // Consume state and handlers from the context
  const {
    categorizedEntries,
    isLoading,
    errorMessage,
    handleCategorise, // Handler from context
    // handleUpdateCategory is no longer used here
    setIsLoading, // Handler from context
    setErrorMessage, // Handler from context
  } = useEntries();

  // Removed activeView state

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      <h1 className="text-center text-3xl font-bold">Clarity</h1>

      {/* Mind Dump Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">1. Mind Dump</h2>
        <MindDumpInput
          // Pass handlers obtained from context
          onCategorise={handleCategorise}
          onError={setErrorMessage} // Pass the error setter from context
          setIsLoading={setIsLoading} // Pass the loading setter from context
        />
      </section>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center text-blue-600">Categorising...</div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded border border-red-400 bg-red-100 p-3 text-center text-red-700">
          Error:
          {' '}
          {errorMessage}
        </div>
      )}

      {/* Organized View Section */}
      {!isLoading && categorizedEntries.length > 0 && (
        // Added margin-top for spacing
        <section className="mt-12">
          <OrganizedView
            entries={categorizedEntries} // Pass entries from context
            // Removed onUpdateCategory prop as it's no longer accepted by OrganizedView
          />
        </section>
      )}

      {/* Daily Planner Section */}
      {!isLoading && categorizedEntries.some(entry => entry.type === 'task') && ( // Only show if there are tasks
        // Added margin-top for spacing
        <section className="mt-12">
          {/* Removed entries prop, component now uses context */}
          <DailyPlanner />
        </section>
      )}
    </div>
  );
}
