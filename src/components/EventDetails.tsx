import React from 'react';
import { X } from 'lucide-react';
import { Event } from '../types';
import { format } from 'date-fns';
import { hu } from 'date-fns/locale';
import { useCalendarStore } from '../store';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
}

export default function EventDetails({ event, onClose }: EventDetailsProps) {
  const { users } = useCalendarStore();
  const creator = users.find(u => u.id === event.createdBy);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Esemény részletei</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-500">Esemény címe</div>
            <div className="text-lg font-medium">{event.title}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Leírás</div>
            <div className="text-gray-700">{event.description || 'Nincs leírás'}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Kezdés</div>
              <div className="text-gray-700">
                {format(new Date(event.start), 'yyyy. MMMM d. HH:mm', { locale: hu })}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Befejezés</div>
              <div className="text-gray-700">
                {format(new Date(event.end), 'yyyy. MMMM d. HH:mm', { locale: hu })}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Létrehozta</div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <span>{creator?.name || 'Ismeretlen felhasználó'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}