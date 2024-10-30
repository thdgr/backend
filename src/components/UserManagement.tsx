import React from 'react';
import { X, Trash2, Shield, ShieldOff } from 'lucide-react';
import { useCalendarStore } from '../store';

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F6', '#33FFF6',
  '#FFB533', '#FF3333', '#33FF33', '#3333FF', '#F633FF'
];

export default function UserManagement() {
  const { users, currentUser, isUserManagementVisible, toggleUserManagement, addUser, updateUser, deleteUser, revokeAdmin } = useCalendarStore();
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [color, setColor] = React.useState(COLORS[0]);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      password,
      color,
      isAdmin,
    });
    setName('');
    setPassword('');
    setColor(COLORS[0]);
    setIsAdmin(false);
  };

  if (!isUserManagementVisible || !currentUser?.isAdmin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Felhasználók kezelése</h2>
          <button onClick={toggleUserManagement} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Új felhasználó</h3>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Szín
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-600' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">
                  Adminisztrátori jogok
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Felhasználó létrehozása
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Felhasználók listája</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span>{user.name}</span>
                    {user.isAdmin && (
                      <Shield className={`w-4 h-4 ${user.isSuperUser ? 'text-purple-600' : 'text-indigo-600'}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!user.isSuperUser && currentUser.isSuperUser && (
                      <>
                        {user.isAdmin ? (
                          <button
                            onClick={() => revokeAdmin(user.id)}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Revoke admin rights"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => updateUser(user.id, { isAdmin: true })}
                            className="text-indigo-600 hover:text-indigo-700"
                            title="Grant admin rights"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}