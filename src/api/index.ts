import { Event, User, Holiday, AuthUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let authToken: string | null = null;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

const headers = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
});

export const api = {
  // Auth
  login: async (id: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });
    const data = await handleResponse(response);
    setAuthToken(data.token);
    return data;
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: headers(),
    });
    return handleResponse(response);
  },

  createUser: async (user: Omit<User, 'id'>) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(user),
    });
    return handleResponse(response);
  },

  // Events
  getEvents: async () => {
    const response = await fetch(`${API_URL}/events`, {
      headers: headers(),
    });
    return handleResponse(response);
  },

  createEvent: async (event: Omit<Event, 'id'>) => {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  updateEvent: async (id: string, event: Partial<Event>) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(event),
    });
    return handleResponse(response);
  },

  deleteEvent: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return handleResponse(response);
  },

  // Holidays
  getHolidays: async () => {
    const response = await fetch(`${API_URL}/holidays`, {
      headers: headers(),
    });
    return handleResponse(response);
  },

  createHoliday: async (holiday: Omit<Holiday, 'id'>) => {
    const response = await fetch(`${API_URL}/holidays`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(holiday),
    });
    return handleResponse(response);
  },
};