'use client'; // Convert to Client Component

import React, { useState } from 'react';

import DailyPlanner from '@/components/DailyPlanner';
import MindDumpInput from '@/components/MindDumpInput';
import OrganizedView from '@/components/OrganizedView';

// Define the type for categorized entries
type Entry = {
  text: string;
  type: string;
};

// Define the type for the API response structure
type CategoriseResponse = {
  entries: Entry[];
};

export default function ClarityPage() {
  const [categorizedEntries, setCategorizedEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCategorise = (data: CategoriseResponse) => {
    setCategorizedEntries(data.entries || []); // Ensure entries is always an array
    setErrorMessage(null); // Clear error on success
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setCategorizedEntries([]); // Clear entries on error
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      <h1 className="text-center text-3xl font-bold">Clarity PoC</h1>

      {/* Mind Dump Section */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">1. Mind Dump</h2>
        <MindDumpInput
          onCategorise={handleCategorise}
          onError={handleError}
          setIsLoading={setIsLoading}
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
          <OrganizedView entries={categorizedEntries} />
        </section>
      )}

      {/* Daily Planner Section */}
      {!isLoading && categorizedEntries.length > 0 && (
        // Added margin-top for spacing
        <section className="mt-12">
          <DailyPlanner entries={categorizedEntries} />
        </section>
      )}
    </div>
  );
}
