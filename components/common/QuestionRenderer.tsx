import React from 'react';
import type { Question } from '../../types';

interface QuestionRendererProps {
  question: Question;
  questionNumber: number;
  userAnswer: string;
  onAnswerChange: (questionId: number, answer: string) => void;
  groupOptions?: string[];
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, questionNumber, userAnswer, onAnswerChange, groupOptions }) => {
  const renderInput = () => {
    switch (question.type) {
      case 'TRUE_FALSE_NOT_GIVEN':
        const options = ['True', 'False', 'Not Given'];
        return (
          <div className="flex flex-col sm:flex-row sm:space-x-4 mt-2">
            {options.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  id={`q-${question.id}-${option}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`q-${question.id}-${option}`} className="text-gray-800">{option}</label>
              </div>
            ))}
          </div>
        );

      case 'MULTIPLE_CHOICE':
        return (
          <div className="flex flex-col space-y-2 mt-2">
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  id={`q-${question.id}-${option.value}`}
                  value={option.value}
                  checked={userAnswer === option.value}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`q-${question.id}-${option.value}`} className="text-gray-800">{option.label}</label>
              </div>
            ))}
          </div>
        );
      
      case 'MATCHING_HEADINGS':
        if (groupOptions && groupOptions.length > 0) {
          return (
            <select
              value={userAnswer || ''}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              className="w-full max-w-sm p-2 border border-gray-300 rounded-md mt-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select a heading...</option>
              {groupOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        // Fallback to text input, though this is not ideal and should not be reached with a correct prompt.
        return (
          <input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full max-w-sm p-2 border border-gray-300 rounded-md mt-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your answer"
          />
        );

      case 'FORM_COMPLETION':
      case 'SENTENCE_COMPLETION':
      case 'SHORT_ANSWER':
      default:
        return (
          <input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
            className="w-full max-w-sm p-2 border border-gray-300 rounded-md mt-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type your answer"
          />
        );
    }
  };

  return (
    <div>
      <p className="font-semibold text-gray-800" dangerouslySetInnerHTML={{ __html: `<strong>${questionNumber}.</strong> ${question.text}` }} />
      <div className="mt-2">
        {renderInput()}
      </div>
    </div>
  );
};

export default QuestionRenderer;