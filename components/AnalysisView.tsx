import React from 'react';
import { DailyAnalysis } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';

interface AnalysisViewProps {
  analysis: DailyAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, isLoading, onAnalyze }) => {
  if (!analysis && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <div className="bg-primary-500/10 p-6 rounded-full mb-4">
          <Brain className="w-16 h-16 text-primary-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">تحلیل هوشمند روزانه</h2>
        <p className="text-gray-400 max-w-xs mb-6">
          هوش مصنوعی فعالیت‌های امروز شما را بررسی می‌کند و برای فردا پیشنهاد می‌دهد.
        </p>
        <button
          onClick={onAnalyze}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1"
        >
          شروع تحلیل امروز
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary-200 animate-pulse">در حال تفکر و بررسی الگوهای شما...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header & Refresh */}
      <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary-500" />
            گزارش عملکرد
          </h2>
          <button 
            onClick={onAnalyze}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-primary-400 transition-colors"
            title="تحلیل مجدد"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-card p-4 rounded-2xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <TrendingUp className="w-20 h-20" />
          </div>
          <span className="text-gray-400 text-sm mb-1">امتیاز بهره‌وری</span>
          <span className="text-4xl font-black text-primary-400">{analysis.productivityScore}</span>
        </div>
        <div className="bg-dark-card p-4 rounded-2xl border border-gray-700 flex flex-col items-center justify-center">
           <span className="text-gray-400 text-sm mb-1">حس و حال</span>
           <span className="text-4xl animate-bounce">{analysis.moodEmoji}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-dark-card p-4 rounded-2xl border border-gray-700 h-64">
        <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          توزیع فعالیت‌ها
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analysis.chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {analysis.chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-5 rounded-2xl border border-indigo-500/30">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          نکات هوشمند
        </h3>
        <ul className="space-y-3">
          {analysis.insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-indigo-100 bg-indigo-950/30 p-3 rounded-xl">
              <span className="mt-1 block min-w-[6px] min-h-[6px] rounded-full bg-indigo-400"></span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/20">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-emerald-400" />
          پیشنهاد برای فردا
        </h3>
        <div className="space-y-2">
          {analysis.suggestions.map((sug, idx) => (
            <div key={idx} className="p-3 bg-emerald-900/30 rounded-xl text-sm text-emerald-100 border border-emerald-500/10">
              {sug}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;