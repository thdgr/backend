import React from 'react';
import Calendar from './components/Calendar';
import UserSelector from './components/UserSelector';
import { useCalendarStore } from './store';

function App() {
  const { error, setError } = useCalendarStore();

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <Calendar />
      <UserSelector />
    </div>
  );
}

export default App;