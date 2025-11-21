import React from 'react';
import { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { Briefcase, Coffee, Moon, Sun } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onStatusChange, onEditTask }) => {
  
  // Separate scheduled and unscheduled tasks
  const scheduledTasks = tasks
    .filter(t => t.startTime)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const unscheduledTasks = tasks.filter(t => !t.startTime);

  // Helper to calculate end time in minutes from midnight
  const getMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to format minutes back to HH:mm
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Render the timeline with gaps
  const renderTimeline = () => {
    if (scheduledTasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 opacity-40">
          <Moon className="w-12 h-12 mb-2 text-indigo-300" />
          <p className="text-sm">جدول زمانی خالی است</p>
        </div>
      );
    }

    const timelineItems = [];
    let lastEndTimeMinutes = -1;

    scheduledTasks.forEach((task, index) => {
      const startMinutes = getMinutes(task.startTime!);
      const duration = task.durationMinutes;
      const endMinutes = startMinutes + duration;

      // Check for gap
      if (lastEndTimeMinutes !== -1 && startMinutes > lastEndTimeMinutes) {
        const gapMinutes = startMinutes - lastEndTimeMinutes;
        if (gapMinutes >= 15) { // Only show gaps larger than 15 mins
           timelineItems.push(
             <div key={`gap-${index}`} className="flex items-center gap-4 py-4 px-2 opacity-60 group">
                <div className="w-12 text-[10px] text-gray-500 text-center flex flex-col gap-1">
                   <span>{formatTime(lastEndTimeMinutes)}</span>
                   <div className="h-8 w-[1px] bg-gray-700 mx-auto"></div>
                   <span>{formatTime(startMinutes)}</span>
                </div>
                <div className="flex-1 border-r-2 border-dashed border-gray-700 mr-4 pr-4 flex items-center text-gray-500 text-xs h-full py-2">
                   <Coffee className="w-4 h-4 ml-2 text-gray-600" />
                   {gapMinutes >= 60 
                     ? `${Math.floor(gapMinutes / 60)} ساعت و ${gapMinutes % 60} دقیقه زمان آزاد` 
                     : `${gapMinutes} دقیقه استراحت`}
                </div>
             </div>
           );
        }
      }

      // Update last end time
      lastEndTimeMinutes = endMinutes;

      // Add the task
      timelineItems.push(
        <div key={task.id} className="flex gap-2 relative">
          {/* Time Column */}
          <div className="w-14 flex-shrink-0 flex flex-col items-center pt-6 text-gray-400">
             <span className="text-sm font-bold font-mono">{task.startTime}</span>
             <div className="flex-1 w-[2px] bg-gradient-to-b from-gray-700 via-gray-800 to-transparent mt-2 mb-2 rounded-full"></div>
          </div>

          {/* Task Column */}
          <div className="flex-1 pb-6 border-r-2 border-primary-500/30 pr-4 relative">
            {/* Connector Dot */}
            <div className="absolute -right-[5px] top-7 w-2.5 h-2.5 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
            
            <TaskCard 
               task={task} 
               onStatusChange={onStatusChange}
               onEdit={() => onEditTask(task)}
            />
          </div>
        </div>
      );
    });

    // Gap after last task
    const endOfDay = 24 * 60;
    if (lastEndTimeMinutes < endOfDay && lastEndTimeMinutes > 0) {
         const remaining = endOfDay - lastEndTimeMinutes;
         if(remaining > 60) {
             timelineItems.push(
                <div key="end-gap" className="flex items-center gap-4 py-4 px-2 opacity-40">
                    <div className="w-12 text-center text-[10px] text-gray-600">
                        {formatTime(lastEndTimeMinutes)}
                    </div>
                    <div className="flex-1 border-r-2 border-dashed border-gray-800 mr-4 pr-4 text-gray-600 text-xs">
                        پایان برنامه ریزی امروز
                    </div>
                </div>
             );
         }
    }

    return timelineItems;
  };

  return (
    <div className="space-y-6">
      
      {/* Unscheduled Tasks Section */}
      {unscheduledTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2 px-2">
            <Briefcase className="w-4 h-4" />
            کارهای لیست شده (بدون زمان)
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-4 px-2 no-scrollbar snap-x">
             {unscheduledTasks.map(task => (
               <div key={task.id} className="min-w-[85vw] md:min-w-[300px] snap-center">
                 <TaskCard 
                    task={task} 
                    onStatusChange={onStatusChange}
                    onEdit={() => onEditTask(task)}
                  />
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="relative pl-2">
         {renderTimeline()}
      </div>
      
    </div>
  );
};

export default TimelineView;