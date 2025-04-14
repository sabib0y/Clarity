'use client';

import React, { useEffect } from 'react'; // Added useEffect
import Link from 'next/link'; // Added Link
import { useEntries } from '@/context/EntriesContext';

import DailyPlanner from '@/components/DailyPlanner';
import MindDumpInput from '@/components/MindDumpInput';
import OrganizedView from '@/components/OrganizedView';


export default function ClarityPage() {
  const {
    categorizedEntries,
    isLoading,
    errorMessage,
    // handleCategorise, // Removed
    setIsLoading,
    setErrorMessage,
    user, // Added user
    fetchEntries, // Added fetchEntries
    supabase, // Added supabase for logout
  } = useEntries();

  // Fetch entries when the component mounts or user changes
  // This might be redundant due to the context's own useEffect, but ensures data loads
  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener in the context will handle clearing state
  };

  // Show login prompt if not logged in
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-md dark:border-gray-700 dark:bg-gray-800">
          <h1 className="mb-4 text-2xl font-semibold">Welcome to Clarity</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Please log in or sign up to continue.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main content for logged-in users
  return (
    <div className="container mx-auto max-w-4xl space-y-8 p-4">
      <div className="flex items-center justify-between">
        {/* Apply Quicksand font to the main title */}
        <h1 className="text-center text-3xl font-bold font-heading">Clarity</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-transparent border border-stone-900 rounded-full text-stone-900 text-base shadow-none transition-all duration-200 hover:-translate-y-1 hover:shadow-[0px_6px_1px_#141211] active:translate-y-1 active:shadow-none" // Removed font-sans (will inherit from body)
        >
          Logout
        </button>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold font-heading">Mind Dump</h2>
        <MindDumpInput
          // onCategorise={handleCategorise} // Removed
          onSuccess={fetchEntries} // Call fetchEntries on successful API call
          onError={setErrorMessage}
          setIsLoading={setIsLoading}
        />
      </section>

      {/* Loading state now primarily reflects fetching entries */}
      {isLoading && !errorMessage && (
        <div className="text-center text-blue-600">Loading entries...</div>
      )}

      {errorMessage && (
        <div className="rounded border border-red-400 bg-red-100 p-3 text-center text-red-700">
          Error: {errorMessage}
        </div>
      )}

      {/* Only show sections if not loading and no error */}
      {!isLoading && !errorMessage && (
        <>
          {categorizedEntries.length > 0 && (
            <section className="mt-12">
              <OrganizedView entries={categorizedEntries} />
            </section>
          )}

          {categorizedEntries.some((entry) => entry.type === 'task') && (
            <section className="mt-12">
              <DailyPlanner />
            </section>
          )}

          {categorizedEntries.length === 0 && (
             <p className="pt-4 text-center text-gray-500 dark:text-gray-400">
               No entries yet. Use the Mind Dump above to get started!
             </p>
          )}
        </>
      )}
    </div>
  );
}
