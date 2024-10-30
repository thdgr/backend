import { create } from 'zustand';
import { Event, User, AuthUser, Holiday } from './types';
import { api, setAuthToken } from './api';

interface CalendarStore {
  events: Event[];
  users: User[];
  holidays: Holiday[];
  currentUser: AuthUser | null;
  currentDate: Date;
  isUserSelectorVisible: boolean;
  isUserManagementVisible: boolean;
  isSidebarVisible: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data fetching
  fetchEvents: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchHolidays: () => Promise<void>;
  
  // Event actions
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // User actions
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Holiday actions
  addHoliday: (holiday: Omit<Holiday, 'id'>) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  
  // Auth actions
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // UI actions
  setCurrentDate: (date: Date) => void;
  toggleUserSelector: () => void;
  toggleUserManagement: () => void;
  toggleSidebar: () => void;
  setError: (error: string | null) => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  users: [],
  holidays: [],
  currentUser: null,
  currentDate: new Date(),
  isUserSelectorVisible: false,
  isUserManagementVisible: false,
  isSidebarVisible: window.innerWidth >= 768,
  isLoading: false,
  error: null,

  // Data fetching
  fetchEvents: async () => {
    try {
      const events = await api.getEvents();
      set({ events });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchUsers: async () => {
    try {
      const users = await api.getUsers();
      set({ users });
    } catch (error) {
      set({ error: error.message });
    }
  },

  fetchHolidays: async () => {
    try {
      const holidays = await api.getHolidays();
      set({ holidays });
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Event actions
  addEvent: async (event) => {
    try {
      const { id } = await api.createEvent(event);
      const newEvent = { ...event, id };
      set((state) => ({ events: [...state.events, newEvent] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateEvent: async (id, updatedEvent) => {
    try {
      await api.updateEvent(id, updatedEvent);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...updatedEvent } : event
        ),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // User actions
  addUser: async (user) => {
    try {
      const { id } = await api.createUser(user);
      const newUser = { ...user, id };
      set((state) => ({ users: [...state.users, newUser] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateUser: async (id, updatedUser) => {
    try {
      await api.updateUser(id, updatedUser);
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...updatedUser } : user
        ),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteUser: async (id) => {
    try {
      await api.deleteUser(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        events: state.events.filter((event) => event.createdBy !== id),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Holiday actions
  addHoliday: async (holiday) => {
    try {
      const { id } = await api.createHoliday(holiday);
      const newHoliday = { ...holiday, id };
      set((state) => ({ holidays: [...state.holidays, newHoliday] }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  deleteHoliday: async (id) => {
    try {
      await api.deleteHoliday(id);
      set((state) => ({
        holidays: state.holidays.filter((holiday) => holiday.id !== id),
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  // Auth actions
  login: async (id, password) => {
    try {
      const { token } = await api.login(id, password);
      setAuthToken(token);
      const users = await api.getUsers();
      const user = users.find(u => u.id === id);
      if (user) {
        const { password: _, ...authUser } = user;
        set({ currentUser: authUser });
        // Fetch initial data after login
        get().fetchEvents();
        get().fetchHolidays();
        return true;
      }
      return false;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ 
      currentUser: null,
      events: [],
      holidays: [],
      error: null
    });
  },

  // UI actions
  setCurrentDate: (date) => set({ currentDate: date }),
  toggleUserSelector: () => set((state) => ({ isUserSelectorVisible: !state.isUserSelectorVisible })),
  toggleUserManagement: () => set((state) => ({ isUserManagementVisible: !state.isUserManagementVisible })),
  toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
  setError: (error) => set({ error }),
}));