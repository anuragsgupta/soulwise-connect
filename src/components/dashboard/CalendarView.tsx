"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckSquare,
  BookOpen,
  Clock,
  Tag,
  Smile,
  Meh,
  Frown
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: string;
  dueDate?: string;
  completed: boolean;
}

interface DiaryEntry {
  id: string;
  title: string;
  mood: 'happy' | 'neutral' | 'sad';
  tags: string[];
  date: string;
  createdAt: Date;
}

interface MoodCheckIn {
  id: string;
  moodScore: number;
  moodLabel: string;
  checkInDate: string;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  type: 'task' | 'diary' | 'mood';
  title: string;
  date: Date;
  data: Task | DiaryEntry | MoodCheckIn;
}

const CalendarView = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    loadEvents();
  }, [user?.id]);

  const loadEvents = async () => {
    const allEvents: CalendarEvent[] = [];

    // Load tasks
    const savedTasks = localStorage.getItem(`tasks_${user?.id}`);
    if (savedTasks) {
      try {
        const tasks: Task[] = JSON.parse(savedTasks);
        tasks.forEach(task => {
          if (task.dueDate) {
            allEvents.push({
              id: `task-${task.id}`,
              type: 'task',
              title: task.title,
              date: new Date(task.dueDate),
              data: task
            });
          }
        });
      } catch (error) {
        console.error('Failed to load tasks:', error);
      }
    }

    // Load diary entries
    const savedDiary = localStorage.getItem(`diary_${user?.id}`);
    if (savedDiary) {
      try {
        const entries: DiaryEntry[] = JSON.parse(savedDiary);
        entries.forEach(entry => {
          allEvents.push({
            id: `diary-${entry.id}`,
            type: 'diary',
            title: entry.title,
            date: new Date(entry.createdAt),
            data: entry
          });
        });
      } catch (error) {
        console.error('Failed to load diary entries:', error);
      }
    }

    // Load mood check-ins from API
    if (user?.id) {
      try {
        const response = await fetch(`/api/mood-checkin/enhanced?studentId=${user.id}&days=30`);
        const data = await response.json();
        
        if (data.success && data.data.moodCheckIns) {
          data.data.moodCheckIns.forEach((mood: MoodCheckIn) => {
            allEvents.push({
              id: `mood-${mood.id}`,
              type: 'mood',
              title: mood.moodLabel,
              date: new Date(mood.checkInDate),
              data: mood
            });
          });
        }
      } catch (error) {
        console.error('Failed to load mood check-ins:', error);
      }
    }

    setEvents(allEvents);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const getMoodEmoji = (moodScore: number) => {
    // Using the same emojis as in MoodSliderScreen
    const moodEmojis: Record<number, string> = {
      1: "😢", // Very Low
      2: "😞", // Low
      3: "😐", // Slightly Low
      4: "🙂", // Neutral
      5: "😊", // Good
      6: "😄", // Great
      7: "🤩", // Excellent
    };
    return moodEmojis[moodScore] || "😊";
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="w-3 h-3 text-green-600" />;
      case 'sad': return <Frown className="w-3 h-3 text-red-600" />;
      default: return <Meh className="w-3 h-3 text-gray-600" />;
    }
  };

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50" />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            today ? 'bg-purple-50 border-purple-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex items-center justify-between mb-1">
            <div className={`text-sm font-medium ${today ? 'text-purple-600' : 'text-gray-700'}`}>
              {day}
            </div>
            {dayEvents.find(e => e.type === 'mood') && (
              <div className="text-4xl leading-none" style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, sans-serif' }}>
                {getMoodEmoji((dayEvents.find(e => e.type === 'mood')!.data as MoodCheckIn).moodScore)}
              </div>
            )}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {dayEvents.filter(e => e.type !== 'mood').slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded truncate flex items-center space-x-1 ${
                  event.type === 'task' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-purple-100 text-purple-800 border border-purple-200'
                }`}
              >
                {event.type === 'task' ? (
                  <>
                    <CheckSquare className="w-2 h-2 flex-shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-2 h-2 flex-shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </>
                )}
              </div>
            ))}
            {dayEvents.filter(e => e.type !== 'mood').length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayEvents.filter(e => e.type !== 'mood').length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-100 border-b border-gray-200 p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);

          return (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                today ? 'border-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <CardHeader className="p-3 pb-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500">{weekDays[index]}</div>
                  <div className={`text-2xl font-bold ${today ? 'text-purple-600' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs px-2 py-1 rounded ${
                        event.type === 'task' 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        {event.type === 'task' ? (
                          <CheckSquare className="w-3 h-3" />
                        ) : (
                          <BookOpen className="w-3 h-3" />
                        )}
                        <span className="font-medium truncate">{event.title}</span>
                      </div>
                      {event.type === 'task' && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor((event.data as Task).priority)}`} />
                          <span className="text-xs">{(event.data as Task).priority}</span>
                        </div>
                      )}
                      {event.type === 'diary' && (
                        <div className="flex items-center space-x-1">
                          {getMoodIcon((event.data as DiaryEntry).mood)}
                          <span className="text-xs">{(event.data as DiaryEntry).mood}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length === 0 && (
                    <div className="text-xs text-gray-400 italic text-center py-2">
                      No events
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderSelectedDateDetails = () => {
    if (!selectedDate) return null;

    const dayEvents = getEventsForDate(selectedDate);
    const tasks = dayEvents.filter(e => e.type === 'task');
    const diaryEntries = dayEvents.filter(e => e.type === 'diary');

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayEvents.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No events on this date</p>
          ) : (
            <div className="space-y-4">
              {tasks.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2 text-blue-600" />
                    Tasks ({tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {tasks.map(event => {
                      const task = event.data as Task;
                      return (
                        <div key={event.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{task.title}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {task.category}
                                </Badge>
                                {task.completed && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {diaryEntries.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-purple-600" />
                    Diary Entries ({diaryEntries.length})
                  </h3>
                  <div className="space-y-2">
                    {diaryEntries.map(event => {
                      const entry = event.data as DiaryEntry;
                      return (
                        <div key={event.id} className="bg-purple-50 border border-purple-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{entry.title}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center">
                                  {getMoodIcon(entry.mood)}
                                  <span className="text-xs ml-1 capitalize">{entry.mood}</span>
                                </div>
                                {entry.tags && entry.tags.length > 0 && (
                                  <div className="flex items-center space-x-1">
                                    {entry.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        <Tag className="w-2 h-2 mr-1" />
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Calendar View
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 border border-gray-200 rounded">
                <Button
                  size="sm"
                  variant={view === 'month' ? 'default' : 'ghost'}
                  onClick={() => setView('month')}
                  className="rounded-r-none"
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={view === 'week' ? 'default' : 'ghost'}
                  onClick={() => setView('week')}
                  className="rounded-l-none"
                >
                  Week
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-lg font-semibold">{monthName}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-3 text-sm">
            <div className="flex items-center space-x-1">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>{events.filter(e => e.type === 'task').length} Tasks</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <span>{events.filter(e => e.type === 'diary').length} Diary Entries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div>
        {view === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      {/* Selected Date Details */}
      {renderSelectedDateDetails()}
    </div>
  );
};

export default CalendarView;
