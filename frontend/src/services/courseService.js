import api from './api';

export const getCourses = async (params = {}) => {
  try {
    const response = await api.get('/courses', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const enrollInCourse = async (courseId) => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses', courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.patch(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/lessons`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCourseAssignments = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/assignments`);
    return response.data;
  } catch (error) {
    throw error;
  }
};