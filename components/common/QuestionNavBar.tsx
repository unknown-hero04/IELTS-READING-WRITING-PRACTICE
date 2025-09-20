import React from 'react';
import type { Question, UserAnswers } from '../../types';

interface QuestionNavBarProps {
  questions: Question[];
  userAnswers: UserAnswers;
  markedQuestions: number[];
  onJumpToQuestion: (questionId: number) => void;
}

const QuestionNavBar: React.FC<QuestionNavBarProps> = ({ questions, userAnswers, markedQuestions, onJumpToQuestion }) => {
  const getStatusClass = (question: Question) => {
    const isMarked = markedQuestions.includes(question.id);
    const isAnswered = userAnswers[question.id] !== undefined && userAnswers[question.id].trim() !== '';
    
    let classNames = 'w-9 h-9 rounded-md font-semibold flex items-center justify-center transition-colors duration-200 focus:outline-none flex-shrink-0';
    
    if (isMarked) {
      classNames += ' bg-yellow-400 text-black hover:bg-yellow-500';
    } else if (isAnswered) {
      classNames += ' bg-green-200 text-green-800 hover:bg-green-300';
    } else {
      classNames += ' bg-gray-200 text-gray-800 hover:bg-gray-300';
    }

    return classNames;
  };

  return (
    <div className="bg-gray-100 p-2 rounded-lg">
       <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {questions.map((q, index) => (
          <button 
            key={q.id} 
            onClick={() => onJumpToQuestion(q.id)} 
            className={getStatusClass(q)}
            aria-label={`Go to question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionNavBar;