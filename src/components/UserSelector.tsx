import React from 'react';
import { useCalendarStore } from '../store';
import { UserCircle2, Shield, LogOut } from 'lucide-react';

export default function UserSelector() {
  const { users, currentUser, login, logout, isUserSelectorVisible, toggleUserSelector } = useCalendarStore();
  const [selectedId, setSelectedId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const panelRef = React.useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(selectedId, password)) {
      setError('');
      setPassword('');
      toggleUserSelector();
    } else {
      setError('Hibás felhasználónév vagy jelszó');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        toggleUserSelector();
      }
    };

    if (isUserSelectorVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserSelectorVisible, toggleUserSelector]);

  if (!isUserSelectorVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50">
      <div 
        ref={panelRef}
        className="absolute top-20 right-6 bg-white rounded-lg shadow-lg p-4 w-64 animate-in slide-in-from-top-2"
      >
        <div className="flex items-center gap-2 mb-3">
          <UserCircle2 className="w-5 h-5 text-gray-600" />
          <span className="font-medium">
            {currentUser ? 'Bejelentkezett felhasználó' : 'Bejelentkezés'}
          </span>
        </div>

        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-md">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentUser.color }}
              />
              <span className="flex-1">{currentUser.name}</span>
              {currentUser.isAdmin && (
                <Shield className="w-4 h-4 text-indigo-600" />
              )}
            </div>
            <button
              onClick={() => {
                logout();
                toggleUserSelector();
              }}
              className="w-full flex items-center gap-2 justify-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Kijelentkezés
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Felhasználó
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Válassz felhasználót...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jelszó
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Bejelentkezés
            </button>
          </form>
        )}
      </div>
    </div>
  );
}