import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ReadingSection, UserAnswers, QuestionGroup, Question } from '../types';
import Header from './common/Header';
import Timer from './common/Timer';
import QuestionNavBar from './common/QuestionNavBar';
import QuestionRenderer from './common/QuestionRenderer';
import Loader from './common/Loader';

interface ReadingTestProps {
  sectionData: ReadingSection;
  onFinish: (answers: UserAnswers) => void;
  isPracticeMode: boolean;
}

const ReadingTest: React.FC<ReadingTestProps> = ({ sectionData, onFinish, isPracticeMode }) => {
  const allQuestions = useMemo(() => 
    sectionData.passages.flatMap(p => p.questionGroups.flatMap(g => g.questions)), 
    [sectionData]
  );
  
  const allQuestionGroups = useMemo(() => 
    sectionData.passages.flatMap(passage => 
      passage.questionGroups.map(group => ({
        group: group,
        passageNumber: passage.passageNumber,
      }))
    ), 
    [sectionData]
  );

  const questionNumberMap = useMemo(() => {
      const map: { [key: number]: number } = {};
      allQuestions.forEach((question, index) => {
          map[question.id] = index + 1;
      });
      return map;
  }, [allQuestions]);

  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [markedQuestions, setMarkedQuestions] = useState<number[]>([]);
  const [scrollToQuestionId, setScrollToQuestionId] = useState<number | null>(null);

  const questionRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  // Effect to scroll to a specific question when jumping from the nav bar
  useEffect(() => {
    if (scrollToQuestionId !== null) {
      const element = questionRefs.current.get(scrollToQuestionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setScrollToQuestionId(null); // Reset after scrolling
    }
  }, [scrollToQuestionId, activeGroupIndex]);


  const activeGroupInfo = allQuestionGroups[activeGroupIndex];
  const currentQuestionGroup = activeGroupInfo?.group;
  const currentPassageNumber = activeGroupInfo?.passageNumber;
  const passageData = sectionData.passages.find(p => p.passageNumber === currentPassageNumber);

  const finalSubmit = useCallback((force = false) => {
    const unansweredCount = allQuestions.filter(q => {
        const answer = userAnswers[q.id];
        return !answer || String(answer).trim() === '';
    }).length;

    if (!force && unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to finish?`)) {
        return;
      }
    }
    onFinish(userAnswers);
  }, [allQuestions, userAnswers, onFinish]);

  const handleTimeUp = useCallback(() => {
    alert("Time is up! Your answers will be submitted automatically.");
    finalSubmit(true);
  }, [finalSubmit]);

  const handleAnswerChange = useCallback((questionId: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);
  
  const handleToggleMark = useCallback((questionId: number) => {
    setMarkedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  }, []);
  
  const handleNext = useCallback(() => {
    if (activeGroupIndex < allQuestionGroups.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
    }
  }, [activeGroupIndex, allQuestionGroups.length]);

  const handlePrev = useCallback(() => {
    if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
    }
  }, [activeGroupIndex]);
  
  const handleJumpToQuestion = useCallback((questionId: number) => {
    const groupIndex = allQuestionGroups.findIndex(gInfo => 
      gInfo.group.questions.some(q => q.id === questionId)
    );
    if (groupIndex !== -1) {
      setActiveGroupIndex(groupIndex);
      setScrollToQuestionId(questionId);
    }
  }, [allQuestionGroups]);

  if (!passageData || !currentQuestionGroup) {
      return <Loader message="Loading test environment..." />;
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header section="Reading">
         {!isPracticeMode && <Timer durationInSeconds={3600} onTimeUp={handleTimeUp} />}
         {isPracticeMode && <div className="font-bold px-4 py-2 rounded-md bg-blue-100 text-blue-800">Practice Mode</div>}
      </Header>
      
      <main className="flex-grow p-2 md:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Panel: Passage */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
            <h2 className="text-xl font-bold p-4 border-b">{passageData?.title}</h2>
            <div className="overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                <div className="prose max-w-none text-justify" dangerouslySetInnerHTML={{ __html: passageData?.content.replace(/\n/g, '<br/>') || '' }} />
            </div>
        </div>
        
        {/* Right Panel: Question Group */}
        <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <p 
                    className="font-semibold text-gray-800" 
                    dangerouslySetInnerHTML={{ __html: currentQuestionGroup.instructions }} 
                />
            </div>
            <div className="p-4 overflow-y-auto space-y-6">
                 {currentQuestionGroup.questions.map(question => (
                    <div 
                        key={question.id}
                        ref={el => { questionRefs.current.set(question.id, el); }}
                    >
                        <QuestionRenderer
                            question={question}
                            questionNumber={questionNumberMap[question.id]}
                            userAnswer={userAnswers[question.id] || ''}
                            onAnswerChange={handleAnswerChange}
                            groupOptions={currentQuestionGroup.options}
                        />
                        <div className="mt-2 flex items-center">
                            <input 
                                type="checkbox"
                                id={`review-${question.id}`}
                                checked={markedQuestions.includes(question.id)}
                                onChange={() => handleToggleMark(question.id)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`review-${question.id}`} className="ml-2 text-sm font-medium text-gray-700">Mark for review</label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </main>
      
      <footer className="bg-white p-2 md:p-4 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
                <button
                    onClick={handlePrev}
                    disabled={activeGroupIndex === 0}
                    className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                    &larr; Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={activeGroupIndex === allQuestionGroups.length - 1}
                    className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                    Next &rarr;
                </button>
            </div>
            <div className="flex-grow w-full sm:w-auto">
                 <QuestionNavBar
                    questions={allQuestions}
                    userAnswers={userAnswers}
                    markedQuestions={markedQuestions}
                    onJumpToQuestion={handleJumpToQuestion}
                />
            </div>
            <button
              onClick={() => finalSubmit(false)}
              className="bg-green-600 text-white font-bold py-2 px-8 rounded-md hover:bg-green-700 transition w-full sm:w-auto"
            >
              Finish & Submit
            </button>
        </div>
      </footer>
    </div>
  );
};

export default ReadingTest;