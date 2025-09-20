
import React, { useState, useEffect } from 'react';

interface LoaderProps {
  message: string;
}

const loadingMessages = [
    "Connecting to the AI...",
    "Generating reading passages...",
    "Crafting writing tasks...",
    "Building your test environment...",
    "Almost ready!",
];

const Loader: React.FC<LoaderProps> = ({ message }) => {
    const [dynamicMessage, setDynamicMessage] = useState(message);

    useEffect(() => {
        // Only cycle messages if it's the generic "Generating" message
        if (message.includes("Generating")) {
            setDynamicMessage(loadingMessages[0]);
            const intervalId = setInterval(() => {
                setDynamicMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 2500); // Change message every 2.5 seconds
            return () => clearInterval(intervalId);
        } else {
            setDynamicMessage(message); // Use the specific message if provided
        }
    }, [message]);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      <p className="mt-6 text-xl font-semibold text-gray-800">{dynamicMessage}</p>
      <p className="mt-2 text-sm text-gray-500">This may take up to 30 seconds. Please don't refresh the page.</p>
    </div>
  );
};

export default Loader;