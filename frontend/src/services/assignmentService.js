import axios from 'axios';
import { API_URL } from '../config';

// Helper to get authorization header
const authHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

// Get all assignments
export const getAllAssignments = async (courseId = null, lessonId = null) => {
  try {
    let url = `${API_URL}/assignments`;
    
    if (courseId) {
      url = `${API_URL}/courses/${courseId}/assignments`;
    } else if (lessonId) {
      url = `${API_URL}/lessons/${lessonId}/assignments`;
    }
    
    const response = await axios.get(url, {
      headers: authHeader()
    });
    
    return response.data.data.assignments;
  } catch (error) {
    throw error;
  }
};

// Add alias for getAssignments function
export const getAssignments = getAllAssignments;

// Get a single assignment by ID
export const getAssignment = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/assignments/${id}`, {
      headers: authHeader()
    });
    
    return response.data.data.assignment;
  } catch (error) {
    throw error;
  }
};

// Add alias for getAssignmentById function
export const getAssignmentById = getAssignment;

// Create a new assignment
export const createAssignment = async (assignmentData, courseId = null, lessonId = null) => {
  try {
    let url = `${API_URL}/assignments`;
    
    if (courseId) {
      url = `${API_URL}/courses/${courseId}/assignments`;
    } else if (lessonId) {
      url = `${API_URL}/lessons/${lessonId}/assignments`;
    }
    
    const response = await axios.post(url, assignmentData, {
      headers: authHeader()
    });
    
    return response.data.data.assignment;
  } catch (error) {
    throw error;
  }
};

// Update an existing assignment
export const updateAssignment = async (id, assignmentData) => {
  try {
    const response = await axios.patch(`${API_URL}/assignments/${id}`, assignmentData, {
      headers: authHeader()
    });
    
    return response.data.data.assignment;
  } catch (error) {
    throw error;
  }
};

// Delete an assignment
export const deleteAssignment = async (id) => {
  try {
    await axios.delete(`${API_URL}/assignments/${id}`, {
      headers: authHeader()
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Submit an assignment
export const submitAssignment = async (id, submissionData) => {
  try {
    const response = await axios.post(`${API_URL}/assignments/${id}/submit`, submissionData, {
      headers: authHeader()
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Grade an assignment submission
export const gradeSubmission = async (assignmentId, submissionId, gradeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/assignments/${assignmentId}/grade/${submissionId}`, 
      gradeData,
      { headers: authHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add alias for gradeAssignment function
export const gradeAssignment = gradeSubmission;

export default {
  getAllAssignments,
  getAssignments,
  getAssignment,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  gradeAssignment
};