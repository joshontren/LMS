import api from './api';

export const getLessons = async (params = {}) => {
  try {
    const response = await api.get('/lessons', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLessonById = async (id) => {
  try {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createLesson = async (lessonData) => {
  try {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.patch(`/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};