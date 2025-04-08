import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MindDumpInput from './MindDumpInput';

global.fetch = jest.fn();

describe('MindDumpInput Component', () => {
  const mockOnSuccess = jest.fn(); // Renamed mock function
  const mockOnError = jest.fn();
  const mockSetIsLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock fetch to return just OK status, no JSON needed for onSuccess
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}), // Return empty object or null if needed
    });
  });

  test('renders the textarea and button', () => {
    render(
      <MindDumpInput
        onSuccess={mockOnSuccess} // Use new prop
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
        onSuccess={mockOnSuccess} // Use new prop
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
        onSuccess={mockOnSuccess} // Use new prop
        onError={mockOnError}
        setIsLoading={mockSetIsLoading}
      />
    );

    const textarea = screen.getByPlaceholderText(/Dump your thoughts here/i);
    const button = screen.getByRole('button', { name: /Categorise Thoughts/i });
    const inputText = 'Test input text';

    fireEvent.change(textarea, { target: { value: inputText } });
    fireEvent.click(button);

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(mockOnError).toHaveBeenCalledWith(null);

    expect(global.fetch).toHaveBeenCalledWith('/api/categorise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputText }),
    });

    // Check if onSuccess was called instead of onCategorise
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  test('calls onError and handlers on failed API call', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    render(
      <MindDumpInput
        onSuccess={mockOnSuccess} // Use new prop
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

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Internal Server Error');
    });
    expect(mockOnSuccess).not.toHaveBeenCalled(); // Check new prop wasn't called
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

});
