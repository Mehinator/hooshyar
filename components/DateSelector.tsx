import React, { useRef, useEffect } from 'react';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate a range of dates (e.g., -2 days to +14 days from today)
  const dates = [];
  const today = new Date();
  for (let i = -5; i < 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  const formatDate = (date: Date) => {
    const iso = date.toLocaleDateString('en-CA');
    return iso;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('fa-IR', { weekday: 'long' });
  };

  const getDayNumber = (date: Date) => {
    return date.toLocaleDateString('fa-IR', { day: 'numeric' });
  };
  
  const getMonthName = (date: Date) => {
      return date.toLocaleDateString('fa-IR', { month: 'short' });
  }

  useEffect(() => {
    if (scrollRef.current) {
      // Simple logic to center the selected date roughly, 
      // in a real app we might calculate offsetLeft
      const selectedIndex = dates.findIndex(d => formatDate(d) === selectedDate);
      if (selectedIndex > -1) {
          const itemWidth = 80; // Approx width
          const containerWidth = scrollRef.current.offsetWidth;
          const scrollPos = (selectedIndex * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
          scrollRef.current.scrollTo({ left: -scrollPos, behavior: 'smooth' }); // Negative for RTL? 
          // Browser handling of scrollLeft in RTL varies. 
          // Standard logical scroll usually works positively from start.
          // Let's try standard scrollIntoView on the element id.
          const el = document.getElementById(`date-${selectedDate}`);
          el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="w-full overflow-hidden mb-4 relative group">
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 overflow-x-auto pb-4 px-4 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((date) => {
          const iso = formatDate(date);
          const isSelected = iso === selectedDate;
          const isToday = iso === formatDate(today);

          return (
            <button
              key={iso}
              id={`date-${iso}`}
              onClick={() => onSelectDate(iso)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border ${
                isSelected 
                  ? 'bg-primary-600 border-primary-500 shadow-lg shadow-primary-900/50 scale-105 z-10' 
                  : 'bg-dark-card border-gray-700 text-gray-400 hover:border-gray-500 hover:bg-gray-800'
              }`}
            >
              <span className={`text-xs font-medium ${isSelected ? 'text-primary-100' : 'text-gray-500'}`}>
                {isToday ? 'امروز' : getDayName(date)}
              </span>
              <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {getDayNumber(date)}
              </span>
              <span className={`text-[10px] ${isSelected ? 'text-primary-200' : 'text-gray-600'}`}>
                 {getMonthName(date)}
              </span>
            </button>
          );
        })}
      </div>
      {/* Fade effects for scroll indication */}
      <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-dark-bg to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-dark-bg to-transparent pointer-events-none"></div>
    </div>
  );
};

export default DateSelector;