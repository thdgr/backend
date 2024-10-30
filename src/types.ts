export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  createdBy: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
  password: string;
  isAdmin?: boolean;
  isSuperUser?: boolean;
}

export interface AuthUser extends Omit<User, 'password'> {}

export interface EventDetails {
  event: Event | null;
  isOpen: boolean;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}