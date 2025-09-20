
import React from 'react';
import { AppState } from '../types';

interface HomeScreenProps {
  onStartTest: (section: AppState, isFull: boolean) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartTest }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">IELTS Academic Simulator</h1>
        <p className="text-gray-600 mb-8">
          Welcome to the IELTS Academic computer-based test simulator. Choose an option below to begin your practice session. This simulator is designed to closely replicate the official test environment.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => onStartTest(AppState.TEST_READING, true)}
            className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg shadow-md"
          >
            Start Full Test
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => onStartTest(AppState.TEST_READING, false)}
              className="bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Practice Reading
            </button>
            <button
              onClick={() => onStartTest(AppState.TEST_WRITING, false)}
              className="bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300"
            >
              Practice Writing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
