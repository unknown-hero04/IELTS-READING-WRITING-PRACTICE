
export enum AppState {
  HOME,
  TEST_READING,
  TEST_WRITING,
  RESULTS,
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FORM_COMPLETION = 'FORM_COMPLETION',
  MATCHING_HEADINGS = 'MATCHING_HEADINGS',
  TRUE_FALSE_NOT_GIVEN = 'TRUE_FALSE_NOT_GIVEN',
  SENTENCE_COMPLETION = 'SENTENCE_COMPLETION',
  SHORT_ANSWER = 'SHORT_ANSWER',
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface QuestionGroup {
  instructions: string;
  questions: Question[];
  options?: string[];
}

export interface ReadingPassage {
  passageNumber: number;
  title: string;
  content: string;
  questionGroups: QuestionGroup[];
}

export interface ReadingSection {
  passages: ReadingPassage[];
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface WritingTask1 {
  prompt: string;
  chartType: 'bar' | 'line' | 'pie';
  data: ChartData[];
  dataKeys: string[];
  colors: string[];
}

export interface WritingTask2 {
  prompt: string;
}

export interface WritingSection {
  task1: WritingTask1;
  task2: WritingTask2;
}

export interface IELTSTest {
  reading: ReadingSection;
  writing: WritingSection;
}

export interface UserAnswers {
  [questionId: number]: string;
}

export interface WritingSubmission {
    task1: string;
    task2: string;
}

export interface WritingFeedback {
  taskAchievement: { band: number; feedback: string };
  coherenceAndCohesion: { band: number; feedback: string };
  lexicalResource: { band: number; feedback: string };
  grammaticalRangeAndAccuracy: { band: number; feedback: string };
  overallBand: number;
  wordCountTask1: number;
  wordCountTask2: number;
}

export interface Results {
  reading: {
    score: number;
    band: number;
    userAnswers: UserAnswers;
    correctAnswers: { [id: number]: string | string[] };
  } | null;
  writing: {
    feedback: WritingFeedback | null;
    submission: WritingSubmission;
  } | null;
  overallBand: number;
}