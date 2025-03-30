'use client';

import React, { useState } from 'react'; // Removed useEffect, useRef

// Define the interface for the SpeechRecognition API, handling vendor prefixes
// Types should be available globally now via @types/dom-speech-recognition
/* // Commenting out unused window declaration and related types
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare let window: SpeechRecognitionWindow;
*/

type MindDumpInputProps = {
  onCategorise: (data: { entries: { text: string; type: string }[] }) => void;
  onError: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
};

const MindDumpInput: React.FC<MindDumpInputProps> = ({
  onCategorise,
  onError,
  setIsLoading,
}) => {
  const [text, setText] = useState('');
  // Commenting out state and logic related to speech recognition
  /*
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check for browser support on component mount
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setIsSpeechRecognitionSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
      // Configure recognition instance (optional)
      // recognitionRef.current.continuous = true; // Keep listening even after pauses
      // recognitionRef.current.interimResults = true; // Get results as they come
      // recognitionRef.current.lang = 'en-US'; // Set language
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
      setIsSpeechRecognitionSupported(false);
    }

    // Cleanup function to stop listening if component unmounts
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

      // Add explicit type for the error event
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        onError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      // Add explicit type for the result event
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        // let interimTranscript = ''; // Commented out as it's unused for now
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            // interimTranscript += event.results[i][0].transcript; // Commented out
          }
        }
         // Append final transcript to existing text, adding a space if needed
        setText((prevText) => prevText.trim() ? `${prevText} ${finalTranscript}` : finalTranscript);

        // Optionally display interim results somewhere if needed
        // console.log('Interim:', interimTranscript);
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
    onError(''); // Clear previous errors

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

      const data = await response.json();
      onCategorise(data);
    } catch (error) {
      console.error('Error calling categorise API:', error);
      onError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Commenting out MicIcon component
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
    <div className="flex flex-col space-y-4">
      <div className="relative w-full"> {/* Added relative container */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          // Updated placeholder since dictation is commented out
          placeholder="Dump your thoughts here... (e.g., Book dentist appointment, Team call at 2pm, Feeling anxious...)"
          rows={10}
          // Removed pr-10 since button is commented out
          className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
        />
        {/* Temporarily commented out dictation button and related logic
        {isSpeechRecognitionSupported && (
           <button
            type="button"
            onClick={handleListen}
            // Adjusted padding, added hover effect, added conditional pulse animation
            className={`absolute bottom-2.5 right-2.5 rounded-full p-1.5 transition-colors duration-150 ${
              isListening
                ? 'animate-pulse bg-red-100 dark:bg-red-900 ring-2 ring-red-300 dark:ring-red-700' // Pulse and ring when listening
                : 'hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md' // Hover effect
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
            title={isListening ? 'Stop Dictation' : 'Start Dictation'}
            aria-label={isListening ? 'Stop Dictation' : 'Start Dictation'}
          >
            <MicIcon listening={isListening} />
          </button>
        )}
        */}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded bg-blue-700 px-4 py-2 font-semibold text-white shadow hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-600 dark:hover:bg-gray-500" // Dark mode button styles
      >
        Categorise Thoughts
      </button>
    </div>
  );
};

export default MindDumpInput;
