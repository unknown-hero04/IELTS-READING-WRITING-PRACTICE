
import { GoogleGenAI, Type } from "@google/genai";
import type { WritingSubmission, WritingFeedback, IELTSTest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateIELTSTest = async (): Promise<IELTSTest> => {
  const prompt = `Generate a complete IELTS Academic computer-based test with Reading and Writing sections.
- The Reading section must have 3 passages and a total of 40 questions.
- Group the reading questions logically by task (e.g., True/False/Not Given, Multiple Choice) and provide clear, concise instructions for each group, exactly as they would appear on an official test.
- For MATCHING_HEADINGS question groups, you MUST provide an 'options' array at the group level containing the list of possible headings. The 'text' for each question in this group should correspond to the paragraph it refers to (e.g., 'Paragraph A').
- For each Reading question, provide a brief but clear explanation for the correct answer.
- The Writing section must have Task 1 with a prompt, chartType ('bar' or 'line'), chart data, dataKeys, and colors. Task 2 should be an academic essay prompt. For the 'data' field in Task 1, you must provide a JSON string.
- Ensure a variety of question types: MULTIPLE_CHOICE, FORM_COMPLETION, MATCHING_HEADINGS, TRUE_FALSE_NOT_GIVEN, SENTENCE_COMPLETION, SHORT_ANSWER.
- For MULTIPLE_CHOICE questions, provide options. For other question types, the options array can be empty.
- The 'correctAnswer' field for all questions must be an array of strings, even if there is only one correct answer.
- Provide realistic content suitable for an official IELTS test.
- **CRITICAL JSON RULE**: The final output MUST be a perfectly valid JSON object. All string values must be properly escaped. Specifically, any double quotes (") inside a string must be escaped with a backslash (\\"). For example, "a \\"quoted\\" word" is a valid JSON string. This is mandatory for successful parsing.
`;

  const questionOptionSchema = {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING },
      value: { type: Type.STRING },
    },
    required: ['label', 'value'],
  };

  const questionSchema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      type: {
        type: Type.STRING,
        enum: [
          'MULTIPLE_CHOICE',
          'FORM_COMPLETION',
          'MATCHING_HEADINGS',
          'TRUE_FALSE_NOT_GIVEN',
          'SENTENCE_COMPLETION',
          'SHORT_ANSWER',
        ],
      },
      text: { type: Type.STRING },
      options: { type: Type.ARRAY, items: questionOptionSchema },
      correctAnswer: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The correct answer(s). Always return an array of strings, even for a single answer."
      },
      explanation: {
        type: Type.STRING,
        description: "A brief explanation for why the answer is correct."
      },
    },
    required: ['id', 'type', 'text', 'correctAnswer', 'explanation'],
  };

  const questionGroupSchema = {
    type: Type.OBJECT,
    properties: {
        instructions: { type: Type.STRING, description: "Instructions for this group of questions (e.g., 'Choose the correct letter, A, B, or C.')." },
        questions: { type: Type.ARRAY, items: questionSchema },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of shared options for the group, such as the list of headings for a MATCHING_HEADINGS task."
        }
    },
    required: ['instructions', 'questions'],
  };

  const readingPassageSchema = {
    type: Type.OBJECT,
    properties: {
      passageNumber: { type: Type.INTEGER },
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      questionGroups: { type: Type.ARRAY, items: questionGroupSchema },
    },
    required: ['passageNumber', 'title', 'content', 'questionGroups'],
  };

  const readingSectionSchema = {
    type: Type.OBJECT,
    properties: { passages: { type: Type.ARRAY, items: readingPassageSchema } },
    required: ['passages'],
  };

  const writingTask1Schema = {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING },
      chartType: { type: Type.STRING, enum: ['bar', 'line'] },
      data: {
        type: Type.STRING,
        description: "A JSON string representing an array of chart data objects. Each object must have a 'name' property (string) and other properties (number) corresponding to the dataKeys."
      },
      dataKeys: { type: Type.ARRAY, items: { type: Type.STRING } },
      colors: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['prompt', 'chartType', 'data', 'dataKeys', 'colors']
  };

  const writingTask2Schema = {
    type: Type.OBJECT,
    properties: { prompt: { type: Type.STRING } },
    required: ['prompt']
  };

  const writingSectionSchema = {
    type: Type.OBJECT,
    properties: {
      task1: writingTask1Schema,
      task2: writingTask2Schema
    },
    required: ['task1', 'task2']
  };

  const ieltsTestSchema = {
    type: Type.OBJECT,
    properties: {
      reading: readingSectionSchema,
      writing: writingSectionSchema
    },
    required: ['reading', 'writing']
  };


  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ieltsTestSchema,
      },
    });

    const jsonText = response.text;
    const testData = JSON.parse(jsonText);

    // Parse the stringified chart data
    if (testData.writing?.task1?.data && typeof testData.writing.task1.data === 'string') {
      try {
        testData.writing.task1.data = JSON.parse(testData.writing.task1.data);
      } catch (e) {
        console.error("Failed to parse chart data JSON string:", e);
        throw new Error("Generated test data has invalid chart data format.");
      }
    }

    if (!testData.reading || !testData.writing) {
      throw new Error("Generated test data is missing required sections.");
    }

    return testData as IELTSTest;
  } catch (error) {
    console.error("Error generating IELTS test:", error);
    throw new Error("Failed to generate a new IELTS test from the AI model.");
  }
};

export const evaluateWriting = async (submission: WritingSubmission): Promise<WritingFeedback> => {
  const prompt = `
    As an expert IELTS examiner, evaluate the provided Writing Task 1 and Task 2 submissions.
    Provide a band score and constructive feedback for each of the four official criteria: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.
    Also calculate an overall band score for the writing section (weighting Task 2 more heavily) and provide the word count for each task.

    Task 1 Submission:
    "${submission.task1}"

    Task 2 Submission:
    "${submission.task2}"

    **CRITICAL JSON RULE**: The final output MUST be a perfectly valid JSON object. All string values must be properly escaped. Specifically, any double quotes (") inside a string must be escaped with a backslash (\\").
  `;

  const feedbackCriteriaSchema = {
    type: Type.OBJECT,
    properties: {
      band: { type: Type.NUMBER },
      feedback: { type: Type.STRING },
    },
    required: ['band', 'feedback'],
  };

  const writingFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
      taskAchievement: feedbackCriteriaSchema,
      coherenceAndCohesion: feedbackCriteriaSchema,
      lexicalResource: feedbackCriteriaSchema,
      grammaticalRangeAndAccuracy: feedbackCriteriaSchema,
      overallBand: { type: Type.NUMBER },
      wordCountTask1: { type: Type.INTEGER },
      wordCountTask2: { type: Type.INTEGER },
    },
    required: [
      'taskAchievement',
      'coherenceAndCohesion',
      'lexicalResource',
      'grammaticalRangeAndAccuracy',
      'overallBand',
      'wordCountTask1',
      'wordCountTask2',
    ],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: writingFeedbackSchema,
      }
    });

    const jsonText = response.text;
    const feedbackData = JSON.parse(jsonText);

    return feedbackData as WritingFeedback;
  } catch (error) {
    console.error("Error evaluating writing:", error);
    throw new Error("Failed to get writing evaluation from the AI model.");
  }
};