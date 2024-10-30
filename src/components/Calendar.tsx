import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useCalendarStore } from '../store';
import EventForm from './EventForm';
import EventDetails from './EventDetails';
import UserManagement from './UserManagement';
import MonthSidebar from './MonthSidebar';
import HolidayManagement from './HolidayManagement';
import { Calendar as CalendarIcon, Plus, Trash2, Edit, ChevronLeft, ChevronRight, UserCircle2, Users, Menu, CalendarDays, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Event } from '../types';

export default function Calendar() {
  const [showEventForm, setShowEventForm] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [showHolidayManagement, setShowHolidayManagement] = React.useState(false);
  const { 
    events, 
    holidays,
    currentUser, 
    deleteEvent, 
    currentDate, 
    setCurrentDate, 
    toggleUserSelector, 
    toggleUserManagement,
    isSidebarVisible,
    toggleSidebar
  } = useCalendarStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const dayEvents = (date: Date) =>
    events.filter((event) => isSameDay(new Date(event.start), date));

  const getHoliday = (date: Date) => {
    return holidays.find(holiday => 
      isSameDay(new Date(holiday.date.replace(/^\d{4}/, format(date, 'yyyy'))), date)
    );
  };

  const canManageEvent = (event: Event) => {
    if (!currentUser) return false;
    return currentUser.isAdmin || event.createdBy === currentUser.id;
  };

  const handleDateClick = (date: Date) => {
    if (currentUser) {
      setSelectedDate(date);
      setEditingEvent(null);
      setShowEventForm(true);
    }
  };

  const handleNewEvent = () => {
    setSelectedDate(new Date());
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        useCalendarStore.setState({ isSidebarVisible: false });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {isSidebarVisible && <MonthSidebar currentDate={currentDate} onMonthSelect={setCurrentDate} />}
      
      <div className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors z-30"
              title={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {isSidebarVisible ? (
                <PanelLeftClose className="w-5 h-5 text-gray-600" />
              ) : (
                <PanelLeftOpen className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
              <CalendarIcon className="w-6 h-6 md:w-7 md:h-7 text-indigo-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Magyar Naptár</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {currentUser && (
              <button
                onClick={handleNewEvent}
                className="flex items-center gap-1 md:gap-2 bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Új esemény</span>
              </button>
            )}
            {currentUser?.isAdmin && (
              <>
                <button
                  onClick={toggleUserManagement}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
                  title="Manage users"
                >
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={() => setShowHolidayManagement(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
                  title="Manage holidays"
                >
                  <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}
            <button
              onClick={toggleUserSelector}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-colors"
              title="User menu"
            >
              <UserCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 md:mb-6 bg-white p-3 rounded-lg shadow-sm">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: hu })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="grid grid-cols-7 text-center py-3 border-b bg-gray-50">
            {['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'].map((day) => (
              <div key={day} className="text-sm md:text-base font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100">
            {days.map((day) => {
              const holiday = getHoliday(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toString()}
                  className={`bg-white p-1 md:p-2 min-h-[80px] md:min-h-[120px] ${
                    !isSameMonth(day, currentDate) ? 'opacity-50 bg-gray-50' : ''
                  } ${currentUser ? 'cursor-pointer hover:bg-gray-50' : ''} 
                    ${isToday ? 'ring-2 ring-indigo-600 ring-inset' : ''}`}
                  onClick={() => currentUser && handleDateClick(day)}
                >
                  <div className={`font-semibold text-xs md:text-sm mb-1 ${
                    isToday ? 'text-indigo-600' : ''
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {holiday && (
                    <div className="text-[10px] md:text-xs p-0.5 md:p-1 mb-1 rounded bg-red-50 text-red-700 truncate border border-red-100">
                      {holiday.name}
                    </div>
                  )}
                  <div className="space-y-1">
                    {dayEvents(day).map((event) => (
                      <div
                        key={event.id}
                        className="text-[10px] md:text-xs p-0.5 md:p-1 rounded-md relative group cursor-pointer border"
                        style={{ 
                          backgroundColor: event.color + '10', 
                          color: event.color,
                          borderColor: event.color + '40'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-gray-600 hidden md:block">
                              {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                            </div>
                          </div>
                          {canManageEvent(event) && (
                            <div className="hidden group-hover:flex gap-1 ml-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingEvent(event);
                                  setSelectedDate(null);
                                  setShowEventForm(true);
                                }}
                                className="p-1 hover:bg-white rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="p-1 hover:bg-white rounded text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showEventForm && (
          <EventForm 
            onClose={() => {
              setShowEventForm(false);
              setEditingEvent(null);
              setSelectedDate(null);
            }}
            event={editingEvent}
            initialDate={selectedDate}
          />
        )}

        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}

        <UserManagement />
        
        {showHolidayManagement && (
          <HolidayManagement onClose={() => setShowHolidayManagement(false)} />
        )}
      </div>
    </div>
  );
}