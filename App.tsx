
import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import ReadingTest from './components/ReadingTest';
import WritingTest from './components/WritingTest';
import ResultsScreen from './components/ResultsScreen';
import Loader from './components/common/Loader';
import { generateIELTSTest, evaluateWriting } from './services/geminiService';
import type { IELTSTest, UserAnswers, WritingSubmission, Results, WritingFeedback } from './types';
import { AppState } from './types';
import { READING_ACADEMIC_BAND_SCORES } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [testData, setTestData] = useState<IELTSTest | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isFullTest, setIsFullTest] = useState<boolean>(false);

  const [readingAnswers, setReadingAnswers] = useState<UserAnswers | null>(null);
  const [writingSubmission, setWritingSubmission] = useState<WritingSubmission | null>(null);

  const calculateScoresAndGenerateFeedback = useCallback(async (finalWritingSubmission: WritingSubmission) => {
    if (!testData || !readingAnswers) {
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Calculating scores and analyzing writing...');

    // Calculate Reading Score
    let readingScore = 0;
    const readingCorrectAnswers: { [id: number]: string | string[] } = {};
    testData.reading.passages.flatMap(p => p.questionGroups.flatMap(g => g.questions)).forEach(q => {
        readingCorrectAnswers[q.id] = q.correctAnswer;
        const userAnswer = readingAnswers[q.id]?.toLowerCase().trim();
        // FIX: Handle multiple possible correct answers by checking if the user's answer is in the array of correct answers.
        const correctAnswers = (Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)])
            .map(ans => String(ans).toLowerCase().trim());
        if (userAnswer && correctAnswers.includes(userAnswer)) {
            readingScore++;
        }
    });
    
    const readingBand = READING_ACADEMIC_BAND_SCORES[readingScore] || 0;
    
    // Get Writing Feedback
    let writingFeedback: WritingFeedback | null = null;
    try {
        writingFeedback = await evaluateWriting(finalWritingSubmission);
    } catch(error) {
        console.error("Failed to get writing feedback:", error);
        alert("Sorry, there was an error analyzing your writing submission.");
    }

    const writingBand = writingFeedback?.overallBand || 0;
    
    const overallBand = (readingBand + writingBand) / 2;

    setResults({
        reading: { score: readingScore, band: readingBand, userAnswers: readingAnswers, correctAnswers: readingCorrectAnswers },
        writing: { feedback: writingFeedback, submission: finalWritingSubmission },
        overallBand: Math.round(overallBand * 2) / 2 // Round to nearest 0.5
    });

    setAppState(AppState.RESULTS);
    setIsLoading(false);

  }, [testData, readingAnswers]);


  const handleStartTest = async (section: AppState, isFull: boolean) => {
    setIsFullTest(isFull);
    setIsLoading(true);
    setLoadingMessage('Generating your IELTS test...');
    
    // Reset previous test data and results
    setTestData(null);
    setResults(null);
    setReadingAnswers(null);
    setWritingSubmission(null);

    try {
      const newTest = await generateIELTSTest();
      setTestData(newTest);
      setAppState(section);
    } catch (error) {
      console.error(error);
      alert("There was an error generating the test. Please try again.");
      setAppState(AppState.HOME);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishReading = (answers: UserAnswers) => {
    setReadingAnswers(answers);
     if(isFullTest) {
        setAppState(AppState.TEST_WRITING);
     } else {
        if(!testData) return;
        // Calculate reading-only results
        let readingScore = 0;
        const readingCorrectAnswers: { [id: number]: string | string[] } = {};
        testData.reading.passages.flatMap(p => p.questionGroups.flatMap(g => g.questions)).forEach(q => {
            readingCorrectAnswers[q.id] = q.correctAnswer;
            const userAnswer = answers[q.id]?.toLowerCase().trim();
            // FIX: Handle multiple possible correct answers by checking if the user's answer is in the array of correct answers.
            const correctAnswers = (Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)])
                .map(ans => String(ans).toLowerCase().trim());
            if (userAnswer && correctAnswers.includes(userAnswer)) {
                readingScore++;
            }
        });
        const readingBand = READING_ACADEMIC_BAND_SCORES[readingScore] || 0;
        setResults({
            reading: { score: readingScore, band: readingBand, userAnswers: answers, correctAnswers: readingCorrectAnswers },
            writing: null,
            overallBand: readingBand
        });
        setAppState(AppState.RESULTS);
    }
  };

  const handleFinishWriting = (submission: WritingSubmission) => {
    setWritingSubmission(submission);
    if (isFullTest) {
      calculateScoresAndGenerateFeedback(submission);
    } else {
      // Logic for single writing section feedback
      const processSingleWriting = async () => {
         setIsLoading(true);
         setLoadingMessage("Analyzing your writing...");
         try {
            const feedback = await evaluateWriting(submission);
            setResults({
                reading: null,
                writing: { feedback, submission },
                overallBand: feedback.overallBand
            });
         } catch (error) {
            console.error("Failed to get writing feedback:", error);
            alert("Sorry, there was an error analyzing your writing submission.");
         } finally {
            setAppState(AppState.RESULTS);
            setIsLoading(false);
         }
      }
      processSingleWriting();
    }
  };
  
  const handleStartNewTest = () => {
    setTestData(null);
    setResults(null);
    setAppState(AppState.HOME);
  };

  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }

  switch (appState) {
    case AppState.HOME:
      return <HomeScreen onStartTest={handleStartTest} />;
    case AppState.TEST_READING:
      return testData ? <ReadingTest sectionData={testData.reading} onFinish={handleFinishReading} isPracticeMode={!isFullTest} /> : <Loader message="Loading test..." />;
    case AppState.TEST_WRITING:
      return testData ? <WritingTest sectionData={testData.writing} onFinish={handleFinishWriting} isPracticeMode={!isFullTest} /> : <Loader message="Loading test..." />;
    case AppState.RESULTS:
      return results && testData ? <ResultsScreen results={results} testData={testData} onStartNewTest={handleStartNewTest} /> : <Loader message="Loading results..." />;
    default:
      return <HomeScreen onStartTest={handleStartTest} />;
  }
};

export default App;
