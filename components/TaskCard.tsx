import React from 'react';
import { Task, TaskStatus, Priority } from '../types';
import { CheckCircle, Circle, Clock, Tag, XCircle, PlayCircle, Edit2, ArrowLeft } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit }) => {
  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case Priority.HIGH: return 'border-red-500/50 text-red-400 bg-red-500/5';
      case Priority.MEDIUM: return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5';
      default: return 'border-blue-500/50 text-blue-400 bg-blue-500/5';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case TaskStatus.COMPLETED: return <CheckCircle className="w-6 h-6 text-green-500" />;
      case TaskStatus.SKIPPED: return <XCircle className="w-6 h-6 text-gray-500" />;
      case TaskStatus.IN_PROGRESS: return <PlayCircle className="w-6 h-6 text-blue-500 animate-pulse" />;
      default: return <Circle className="w-6 h-6 text-gray-400 hover:text-primary-400 transition-colors" />;
    }
  };

  // Calculate End Time
  const getEndTime = () => {
    if (!task.startTime) return null;
    const [h, m] = task.startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + task.durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const endTime = getEndTime();

  return (
    <div className={`group relative flex flex-col p-4 rounded-2xl bg-dark-card border border-gray-800 shadow-lg transition-all duration-300 hover:border-gray-600 hover:shadow-primary-900/10 hover:translate-x-[-2px] ${task.status === TaskStatus.COMPLETED ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}>
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const nextStatus = task.status === TaskStatus.PENDING ? TaskStatus.COMPLETED : TaskStatus.PENDING;
              onStatusChange(task.id, nextStatus);
            }}
            className="focus:outline-none transition-transform active:scale-90"
          >
            {getStatusIcon()}
          </button>
          
          <div className="flex-1">
            <h3 className={`font-bold text-base md:text-lg leading-tight ${task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.description && <p className="text-xs text-gray-500 line-clamp-1 mt-1">{task.description}</p>}
          </div>
        </div>

        <button 
           onClick={onEdit}
           className="p-1.5 text-gray-600 hover:text-white hover:bg-gray-700 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
           <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-800/50">
        <div className="flex items-center gap-3">
             <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
               {task.priority === Priority.HIGH ? 'مهم' : task.priority === Priority.MEDIUM ? 'متوسط' : 'عادی'}
             </span>
             
             <span className="flex items-center text-[10px] text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded-md">
               <Clock className="w-3 h-3 ml-1" />
               {task.startTime ? (
                  <span className="flex items-center gap-1 ltr">
                    <span>{task.startTime}</span>
                    {endTime && (
                        <>
                           <ArrowLeft className="w-2 h-2 text-gray-600" />
                           <span>{endTime}</span>
                        </>
                    )}
                  </span>
               ) : (
                 <span>{task.durationMinutes} دقیقه</span>
               )}
             </span>
        </div>

        <div className="flex items-center gap-2">
           <span className="text-[10px] text-primary-400 flex items-center">
             <Tag className="w-3 h-3 ml-1" /> {task.category}
           </span>
        </div>
      </div>
      
      {/* Action strip visible on hover or if status is active */}
      {(task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.SKIPPED) && (
         <div className="mt-2 flex justify-end">
             <span className={`text-[10px] px-2 py-0.5 rounded ${task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
                {task.status === TaskStatus.IN_PROGRESS ? 'در حال انجام' : 'لغو شده'}
             </span>
         </div>
      )}
    </div>
  );
};

export default TaskCard;