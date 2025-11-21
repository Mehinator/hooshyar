import React, { useState } from 'react';
import { Mic, Send, Sparkles, Loader2 } from 'lucide-react';

interface QuickAddProps {
  onAdd: (text: string) => Promise<void>;
  isLoading: boolean;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onAdd, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onAdd(text);
    setText('');
  };

  return (
    <div className="fixed bottom-20 md:bottom-10 left-0 right-0 px-4 flex justify-center z-20">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-dark-card/90 backdrop-blur-lg border border-primary-500/30 shadow-2xl rounded-2xl p-2 flex items-center gap-2 ring-1 ring-white/10"
      >
        <div className="w-10 h-10 flex items-center justify-center text-primary-400">
            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </div>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="مثلاً: فردا ساعت ۱۰ صبح جلسه با تیم فنی دارم..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-right text-sm md:text-base h-10"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 text-white p-3 rounded-xl transition-colors"
        >
          <Send className={`w-5 h-5 ${text.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5' : ''} transition-transform`} />
        </button>
      </form>
    </div>
  );
};

export default QuickAdd;