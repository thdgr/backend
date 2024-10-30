import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCalendarStore } from '../store';
import { format } from 'date-fns';

interface HolidayManagementProps {
  onClose: () => void;
}

export default function HolidayManagement({ onClose }: HolidayManagementProps) {
  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useCalendarStore();
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHoliday({
      name,
      date: date.replace(/^\d{4}/, '2000'),
    });
    setName('');
    setDate('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Ünnepnapok kezelése</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Új ünnepnap</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Név
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dátum
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Ünnepnap hozzáadása
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Ünnepnapok listája</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{holiday.name}</div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(holiday.date), 'MMMM d.')}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteHoliday(holiday.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}