
import React, { useState, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { WritingSection, WritingSubmission } from '../types';
import Header from './common/Header';
import Timer from './common/Timer';

interface WritingTestProps {
  sectionData: WritingSection;
  onFinish: (submission: WritingSubmission) => void;
  isPracticeMode: boolean;
}

const WritingTest: React.FC<WritingTestProps> = ({ sectionData, onFinish, isPracticeMode }) => {
  const [activeTab, setActiveTab] = useState<'task1' | 'task2'>('task1');
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');

  const handleTimeUp = useCallback(() => {
    alert("Time is up! Your answers will be submitted automatically.");
    onFinish({ task1: task1Text, task2: task2Text });
  }, [onFinish, task1Text, task2Text]);

  const wordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const task1WordCount = wordCount(task1Text);
  const task2WordCount = wordCount(task2Text);
  
  const meetsWordCount = task1WordCount >= 150 && task2WordCount >= 250;
  const canFinish = isPracticeMode || meetsWordCount;

  const handleFinish = () => {
    if (!isPracticeMode && !meetsWordCount) {
        alert("Please ensure Task 1 has at least 150 words and Task 2 has at least 250 words.");
        return;
    }
     if (isPracticeMode && !meetsWordCount) {
        if (!window.confirm("Your response is below the recommended word count. The feedback may be less accurate. Do you want to submit anyway?")) {
            return;
        }
    }
    onFinish({ task1: task1Text, task2: task2Text });
  };
  
  const renderChart = () => {
    const { chartType, data, dataKeys, colors } = sectionData.task1;
    return (
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />)}
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={colors[index % colors.length]} />)}
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <Header section="Writing">
        {!isPracticeMode && <Timer durationInSeconds={3600} onTimeUp={handleTimeUp} />}
        {isPracticeMode && <div className="font-bold px-4 py-2 rounded-md bg-blue-100 text-blue-800">Practice Mode</div>}
      </Header>
      <main className="flex-grow p-4 md:p-6 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl h-[calc(100vh-140px)] flex flex-col">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('task1')} className={`${activeTab === 'task1' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Task 1
                    </button>
                    <button onClick={() => setActiveTab('task2')} className={`${activeTab === 'task2' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                        Task 2
                    </button>
                </nav>
            </div>
            <div className="flex-grow mt-4 flex flex-col">
                {activeTab === 'task1' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                        <div className="flex flex-col">
                           <h3 className="font-bold text-lg mb-2">Writing Task 1</h3>
                           <p className="text-gray-600 mb-4">{sectionData.task1.prompt}</p>
                           <div className="flex-grow">
                             {renderChart()}
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <textarea
                                value={task1Text}
                                onChange={(e) => setTask1Text(e.target.value)}
                                className="w-full h-full p-2 border border-gray-300 rounded-md resize-none flex-grow"
                                placeholder="Type your answer for Task 1 here..."
                            />
                            <p className={`text-sm mt-1 ${task1WordCount < 150 ? 'text-red-500' : 'text-green-600'}`}>Word Count: {task1WordCount}</p>
                        </div>
                    </div>
                )}
                {activeTab === 'task2' && (
                    <div className="flex flex-col h-full">
                         <h3 className="font-bold text-lg mb-2">Writing Task 2</h3>
                         <p className="text-gray-600 mb-4">{sectionData.task2.prompt}</p>
                         <textarea
                            value={task2Text}
                            onChange={(e) => setTask2Text(e.target.value)}
                            className="w-full h-full p-2 border border-gray-300 rounded-md resize-none flex-grow"
                            placeholder="Type your answer for Task 2 here..."
                         />
                         <p className={`text-sm mt-1 ${task2WordCount < 250 ? 'text-red-500' : 'text-green-600'}`}>Word Count: {task2WordCount}</p>
                    </div>
                )}
            </div>
        </div>
      </main>
      <footer className="bg-white p-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex justify-end">
            <button
                onClick={handleFinish}
                disabled={!canFinish}
                className={`font-bold py-2 px-8 rounded-md transition ${canFinish ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
            >
                Finish Section
            </button>
        </div>
      </footer>
    </div>
  );
};

export default WritingTest;