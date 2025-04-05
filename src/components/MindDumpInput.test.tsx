import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Removed explicit import of describe, test, expect, jest, beforeEach
import MindDumpInput from './MindDumpInput'; // Adjust the import path as necessary

// Mock the global fetch function
global.fetch = jest.fn();

describe('MindDumpInput Component', () => {
  const mockOnCategorise = jest.fn();
  const mockOnError = jest.fn();
  const mockSetIsLoading = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Reset fetch mock to a default successful response for simplicity in basic tests
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [{ text: 'Test task', type: 'task', priority: 1 }] }),
    });
  });

  test('renders the textarea and button', () => {
    render(
      <MindDumpInput
        onCategorise={mockOnCategorise}
        onError={mockOnError}
        setIsLoading={mockSetIsLoading}
      />
    );

    expect(screen.getByPlaceholderText(/Dump your thoughts here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Categorise Thoughts/i })).toBeInTheDocument();
  });

  test('calls onError when submitting empty text', () => {
    render(
      <MindDumpInput
        onCategorise={mockOnCategorise}
        onError={mockOnError}
        setIsLoading={mockSetIsLoading}
      />
    );

    const button = screen.getByRole('button', { name: /Categorise Thoughts/i });
    fireEvent.click(button);

    expect(mockOnError).toHaveBeenCalledWith('Please enter some text before submitting.');
    expect(mockSetIsLoading).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('calls fetch and handlers on successful submission', async () => {
    render(
      <MindDumpInput
        onCategorise={mockOnCategorise}
        onError={mockOnError}
        setIsLoading={mockSetIsLoading}
      />
    );

    const textarea = screen.getByPlaceholderText(/Dump your thoughts here/i);
    const button = screen.getByRole('button', { name: /Categorise Thoughts/i });
    const inputText = 'Test input text';

    fireEvent.change(textarea, { target: { value: inputText } });
    fireEvent.click(button);

    // Check loading state changes
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockOnError).toHaveBeenCalledWith(''); // Error cleared

    // Check fetch call
    expect(global.fetch).toHaveBeenCalledWith('/api/categorise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputText }),
    });

    // Wait for the fetch promise to resolve and state updates to occur
    await waitFor(() => {
      expect(mockOnCategorise).toHaveBeenCalledWith({ entries: [{ text: 'Test task', type: 'task', priority: 1 }] });
    });

    // Check loading state reset
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  test('calls onError and handlers on failed API call', async () => {
     // Mock fetch to return an error response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    render(
      <MindDumpInput
        onCategorise={mockOnCategorise}
        onError={mockOnError}
        setIsLoading={mockSetIsLoading}
      />
    );

    const textarea = screen.getByPlaceholderText(/Dump your thoughts here/i);
    const button = screen.getByRole('button', { name: /Categorise Thoughts/i });
    const inputText = 'Test input causing error';

    fireEvent.change(textarea, { target: { value: inputText } });
    fireEvent.click(button);

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Wait for the fetch promise to resolve and error handling to occur
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Internal Server Error');
    });
    expect(mockOnCategorise).not.toHaveBeenCalled();
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  // Add more tests later for speech recognition if uncommented
});
