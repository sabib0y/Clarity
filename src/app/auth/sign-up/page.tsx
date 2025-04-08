'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Removed as it's not used currently
import { createClient } from '@/lib/supabase/client'; // Use browser client

export default function SignUpPage() {
  // const router = useRouter(); // Removed as it's not used currently
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      // Optional: Redirect URL after email confirmation
      // options: {
      //   emailRedirectTo: `${location.origin}/auth/callback`,
      // },
    });

    if (error) {
      setError(error.message);
    } else {
      // By default, Supabase sends a confirmation email.
      // You might want to disable this in Supabase project settings for easier testing initially.
      // Go to Authentication -> Providers -> Email -> Disable "Confirm email" toggle.
      setMessage(
        'Sign up successful! Please check your email to confirm your account (if enabled).'
      );
      // Optionally redirect immediately or after a delay
      // router.push('/');
      // router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-white font-heading">
          Create Account
        </h1>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6} // Supabase default minimum password length
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <p className="mb-4 text-center text-sm text-red-600 dark:text-red-500">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 text-center text-sm text-green-600 dark:text-green-500">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <a
            href="/auth/login" // Link back to login page
            className="font-medium text-blue-600 hover:underline dark:text-blue-500"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
