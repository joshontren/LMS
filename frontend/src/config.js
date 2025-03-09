// API URL Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Application settings
export const APP_NAME = 'LMS Platform';
export const APP_VERSION = '1.0.0';

// File upload settings
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// Role-based access levels
export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
};

// Course categories
export const COURSE_CATEGORIES = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'science', label: 'Science' },
  { value: 'language', label: 'Language' },
  { value: 'other', label: 'Other' }
];

// Course difficulty levels
export const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export default {
  API_URL,
  APP_NAME,
  APP_VERSION,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  DEFAULT_PAGE_SIZE,
  ROLES,
  COURSE_CATEGORIES,
  COURSE_LEVELS
};