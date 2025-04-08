'use client';

import React, { useState } from 'react';


// Removed CategoriseResponse import as it's no longer passed


type MindDumpInputProps = {
  onSuccess: () => void; // Changed prop name and signature
  onError: (message: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

const MindDumpInput: React.FC<MindDumpInputProps> = ({
  onSuccess, // Changed prop name
  onError,
  setIsLoading,
}) => {
  const [text, setText] = useState('');

  /*
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      setIsSpeechRecognitionSupported(false);
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);


  const handleListen = () => {
    if (!isSpeechRecognitionSupported || !recognitionRef.current) {
      onError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Setup event listeners before starting
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onError(''); // Clear any previous errors
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        onError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
          }
        }
        setText((prevText) => prevText.trim() ? `${prevText} ${finalTranscript}` : finalTranscript);

      };

      try {
        recognitionRef.current.start();
      } catch (error) {
         console.error('Error starting speech recognition:', error);
         onError('Could not start speech recognition. Check microphone permissions.');
         setIsListening(false);
      }
    }
  };
  */

  const handleSubmit = async () => {
    if (!text.trim()) {
      onError('Please enter some text before submitting.');
      return;
    }
    setIsLoading(true);
    onError(null);

    try {
      const response = await fetch('/api/categorise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // const data = await response.json(); // Don't need to parse data here anymore
      // onCategorise(data); // Removed
      onSuccess(); // Call the success callback
    } catch (error) {
      console.error('Error calling categorise API:', error);
      onError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  /*
  const MicIcon = ({ listening }: { listening: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      // Increased size slightly
      className={`h-7 w-7 ${listening ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
  */


  return (
    <div className="flex flex-col space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div className="relative w-full">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Dump your thoughts here... (e.g., Book dentist appointment, Team call at 2pm, Feeling anxious...)"
          rows={10}
          className="w-full rounded border border-gray-200 bg-white p-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-400"
        />
      </div>
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-gray-100 px-6 py-2 font-medium text-gray-800 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Categorise Thoughts
        </button>
        <button
          type="button"
          onClick={() => {
            const testData = `Book dentist appointment for Tuesday afternoon.\nTeam meeting at 2pm tomorrow.\nFeeling a bit overwhelmed today.\nIdea: New structure for project notes.\nRemember to buy milk.\nPay electricity bill.\nVacation next thursday for 3 days.`;
            setText(testData);
          }}
          className="rounded-lg border border-blue-300 bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          title="Load sample text into the textarea"
        >
          Load Test Data
        </button>
      </div>
    </div>
  );
};

export default MindDumpInput;
