'use client';

import React from 'react';
import { useEntries } from '@/context/EntriesContext';

import DailyPlanner from '@/components/DailyPlanner';
import MindDumpInput from '@/components/MindDumpInput';
import OrganizedView from '@/components/OrganizedView';


export default function ClarityPage() {
  const {
    categorizedEntries,
    isLoading,
    errorMessage,
    handleCategorise,
    setIsLoading,
    setErrorMessage,
  } = useEntries();


  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      <h1 className="text-center text-3xl font-bold">Clarity</h1>

      <section>
        <h2 className="mb-4 text-xl font-semibold">1. Mind Dump</h2>
        <MindDumpInput
          onCategorise={handleCategorise}
          onError={setErrorMessage}
          setIsLoading={setIsLoading}
        />
      </section>

      {isLoading && (
        <div className="text-center text-blue-600">Categorising...</div>
      )}

      {errorMessage && (
        <div className="rounded border border-red-400 bg-red-100 p-3 text-center text-red-700">
          Error:
          {' '}
          {errorMessage}
        </div>
      )}

      {!isLoading && categorizedEntries.length > 0 && (
        <section className="mt-12">
          <OrganizedView
            entries={categorizedEntries}
          />
        </section>
      )}

      {!isLoading && categorizedEntries.some(entry => entry.type === 'task') && (
        <section className="mt-12">
          <DailyPlanner />
        </section>
      )}
    </div>
  );
}
