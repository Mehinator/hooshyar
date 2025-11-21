import React, { useState, useEffect } from 'react';
import { Task, DailyAnalysis, ViewState, TaskStatus } from './types';
import { parseNaturalLanguageTask, analyzeDailyProductivity } from './services/aiService';
import QuickAdd from './components/QuickAdd';
import AnalysisView from './components/AnalysisView';
import DateSelector from './components/DateSelector';
import TimelineView from './components/TimelineView';
import EditTaskModal from './components/EditTaskModal';
import { Calendar, BarChart2, Plus, User } from 'lucide-react';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewState>('timeline');
  const [analysis, setAnalysis] = useState<DailyAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Default to today in local time YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

  // Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('hoshyar_tasks');
    const savedAnalysis = localStorage.getItem('hoshyar_analysis');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedAnalysis) {
      const parsed = JSON.parse(savedAnalysis);
      // Only restore analysis if it matches selected date
      const analysisDate = new Date(parsed.date).toLocaleDateString('en-CA');
      if (analysisDate === selectedDate) {
        setAnalysis(parsed);
      } else {
        setAnalysis(null);
      }
    }
  }, []); // Only run on mount

  // Reset analysis when date changes, unless we have logic to store per-date analysis
  useEffect(() => {
      setAnalysis(null);
  }, [selectedDate]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('hoshyar_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = async (text: string) => {
    setIsProcessing(true);
    try {
      const results = await parseNaturalLanguageTask(text);
      
      const newTasks: Task[] = results.map((res, index) => ({
        id: Date.now().toString() + index, // Ensure unique IDs
        status: TaskStatus.PENDING,
        ...res
      }));

      setTasks(prev => [...prev, ...newTasks]);
      
      // Auto-switch date if added for another day
      const addedDates = [...new Set(newTasks.map(t => t.date))];
      if (addedDates.length === 1 && addedDates[0] !== selectedDate) {
          setSelectedDate(addedDates[0]);
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const handleTaskStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status, completedAt: status === TaskStatus.COMPLETED ? new Date().toISOString() : undefined } : t
    ));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    try {
      const filteredTasks = tasks.filter(t => t.date === selectedDate);
      const result = await analyzeDailyProductivity(filteredTasks);
      setAnalysis(result);
      localStorage.setItem('hoshyar_analysis', JSON.stringify(result));
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter tasks for selected date
  const currentTasks = tasks.filter(t => t.date === selectedDate);

  // Calculate Progress for selected date
  const completedCount = currentTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const totalCount = currentTasks.length;
  const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-l from-primary-400 to-indigo-400 bg-clip-text text-transparent">
            هوشیار
          </h1>
          <p className="text-xs text-gray-400">دستیار هوشمند زندگی</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
          <User className="w-5 h-5 text-gray-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl p-4">
        {view === 'timeline' && (
          <div className="space-y-4 animate-fade-in">
            
            <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />

            {/* Progress Bar */}
            {currentTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>پیشرفت</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Smart Timeline View */}
            <TimelineView 
              tasks={currentTasks}
              onStatusChange={handleTaskStatusChange}
              onEditTask={handleEditTask}
            />
          </div>
        )}

        {view === 'analysis' && (
          <AnalysisView 
            analysis={analysis} 
            isLoading={isProcessing} 
            onAnalyze={handleAnalyze} 
          />
        )}
      </main>

      {/* Modals */}
      {editingTask && (
        <EditTaskModal 
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}

      {/* Floating Actions & Navigation */}
      {view === 'timeline' && (
         <QuickAdd onAdd={handleAddTask} isLoading={isProcessing} />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur border-t border-gray-800 pb-safe z-30">
        <div className="flex justify-around items-center p-2">
          <button 
            onClick={() => setView('timeline')}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${view === 'timeline' ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">برنامه روزانه</span>
          </button>

          <button 
            onClick={() => setView('timeline')}
            className="md:hidden -mt-8 bg-gradient-to-br from-primary-600 to-primary-700 hover:to-primary-600 text-white p-4 rounded-full shadow-lg shadow-primary-600/40 transition-transform active:scale-95 border-4 border-dark-bg"
          >
            <Plus className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setView('analysis')}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${view === 'analysis' ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] mt-1 font-medium">تحلیل هوشمند</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;