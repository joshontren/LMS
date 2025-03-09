import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const EnrollmentButton = ({ courseId, isEnrolled: initialEnrollmentStatus, onEnrollmentChange }) => {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(initialEnrollmentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsEnrolled(initialEnrollmentStatus);
  }, [initialEnrollmentStatus]);

  const handleEnroll = async () => {
    if (isEnrolled) return; // Already enrolled
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsEnrolled(true);
      if (onEnrollmentChange) {
        onEnrollmentChange(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is an instructor, don't show enrollment button
  if (user?.role === 'instructor') {
    return null;
  }

  if (isEnrolled) {
    return (
      <Button 
        variant="success" 
        disabled
        className="w-100"
      >
        <i className="bi bi-check-circle-fill me-2"></i>
        Enrolled
      </Button>
    );
  }

  return (
    <Button 
      variant="primary" 
      onClick={handleEnroll} 
      disabled={isLoading}
      className="w-100"
    >
      {isLoading ? (
        <>
          <Spinner 
            as="span" 
            animation="border" 
            size="sm" 
            role="status" 
            aria-hidden="true"
            className="me-2"
          />
          Enrolling...
        </>
      ) : (
        <>
          <i className="bi bi-book me-2"></i>
          Enroll Now
        </>
      )}
    </Button>
  );
};

export default EnrollmentButton;