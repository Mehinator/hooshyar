import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Clock, Calendar, Type } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [duration, setDuration] = useState(task.durationMinutes.toString());

  useEffect(() => {
    setTitle(task.title);
    setStartTime(task.startTime || '');
    setDuration(task.durationMinutes.toString());
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      startTime: startTime || undefined,
      durationMinutes: parseInt(duration) || 30
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-card border border-gray-700 w-full max-w-sm rounded-2xl shadow-2xl p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">ویرایش کار</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
              <Type className="w-3 h-3" />
              عنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-bg border border-gray-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ساعت شروع
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-dark-bg border border-gray-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none transition-colors ltr text-center"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                مدت (دقیقه)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="5"
                step="5"
                className="w-full bg-dark-bg border border-gray-700 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none transition-colors text-center"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              لغو
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-3 rounded-xl hover:bg-primary-500 transition-colors font-bold shadow-lg shadow-primary-600/20"
            >
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;