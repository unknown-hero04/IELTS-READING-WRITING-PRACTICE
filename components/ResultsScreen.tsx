
import React, { useState } from 'react';
import type { Results, IELTSTest } from '../types';

interface ResultsScreenProps {
  results: Results;
  testData: IELTSTest;
  onStartNewTest: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, testData, onStartNewTest }) => {
    const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
    const allReadingQuestions = testData.reading.passages.flatMap(p => p.questionGroups.flatMap(g => g.questions));
    const hasReadingResults = results.reading !== null;
    const hasWritingResults = results.writing !== null;

    const toggleExplanation = (questionId: number) => {
        setExpandedExplanation(prev => prev === questionId ? null : questionId);
    };

    const CorrectIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    );

    const IncorrectIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.697a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
          <h1 className="text-4xl font-bold text-gray-800">Test Results</h1>
          <div className="mt-3 sm:mt-0 text-right">
            <p className="text-lg text-gray-600">Overall Band Score</p>
            <p className="text-5xl font-extrabold text-blue-600">{results.overallBand.toFixed(1)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {hasReadingResults && (
                <div className="bg-gray-50 p-6 rounded-lg text-center border">
                    <h2 className="text-xl font-semibold text-gray-700">Reading</h2>
                    <p className="text-4xl font-bold text-blue-500 my-2">{results.reading.band.toFixed(1)}</p>
                    <p className="text-gray-500">{results.reading.score} / 40 Correct</p>
                </div>
            )}
            {hasWritingResults && (
                <div className="bg-gray-50 p-6 rounded-lg text-center border">
                    <h2 className="text-xl font-semibold text-gray-700">Writing</h2>
                    <p className="text-4xl font-bold text-blue-500 my-2">{results.writing.feedback?.overallBand.toFixed(1) || 'N/A'}</p>
                    <p className="text-gray-500">AI-Assessed</p>
                </div>
            )}
        </div>

        {/* Writing Feedback */}
        {hasWritingResults && results.writing.feedback && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Writing Feedback</h2>
            <div className="space-y-4">
                {[
                    { title: "Task Achievement / Response", data: results.writing.feedback.taskAchievement },
                    { title: "Coherence and Cohesion", data: results.writing.feedback.coherenceAndCohesion },
                    { title: "Lexical Resource", data: results.writing.feedback.lexicalResource },
                    { title: "Grammatical Range and Accuracy", data: results.writing.feedback.grammaticalRangeAndAccuracy },
                ].map(item => (
                    <div key={item.title} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-gray-800">{item.title}</h3>
                            <p className="text-lg font-bold text-blue-600">Band: {item.data.band.toFixed(1)}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{item.data.feedback}</p>
                    </div>
                ))}
            </div>
          </div>
        )}

         {/* Reading Answers */}
        {hasReadingResults && (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Reading Answers Review</h2>
                 <div className="overflow-auto max-h-[40rem] border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Q</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Result</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Answer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answer</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Explanation</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                           {allReadingQuestions.map((q, i) => {
                               const userAnswer = results.reading.userAnswers[q.id] || 'No Answer';
                               const displayedCorrectAnswer = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(' / ') : q.correctAnswer;
                               const correctAnswers = (Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)])
                                .map(ans => String(ans).toLowerCase().trim());
                               const isCorrect = correctAnswers.includes(userAnswer.trim().toLowerCase());
                               return (
                                <React.Fragment key={q.id}>
                                    <tr className={isCorrect ? 'bg-green-50/50' : 'bg-red-50/50'}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{i + 1}</td>
                                        <td className="px-4 py-3 whitespace-nowrap"><div className="flex justify-center">{isCorrect ? <CorrectIcon /> : <IncorrectIcon />}</div></td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${isCorrect ? 'text-gray-800' : 'text-red-700'}`}>{userAnswer}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-800">{displayedCorrectAnswer}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            {q.explanation && (
                                                <button onClick={() => toggleExplanation(q.id)} className="text-blue-600 hover:underline text-sm font-semibold">
                                                    {expandedExplanation === q.id ? 'Hide' : 'Show'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedExplanation === q.id && q.explanation && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={5} className="px-6 py-4 text-sm text-gray-800 border-l-4 border-blue-500">
                                                <p><strong>Explanation:</strong> {q.explanation}</p>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                               );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="mt-8 text-center">
            <button
                onClick={onStartNewTest}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg"
            >
                Start a New Test
            </button>
        </div>

      </div>
    </div>
  );
};

export default ResultsScreen;
