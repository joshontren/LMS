import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const AssignmentForm = () => {
  const { courseId, lessonId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(assignmentId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100,
    isPublished: false,
    lesson: lessonId || '' // Default to the lesson ID from URL params if available
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch lessons for the course
        if (courseId) {
          const lessonsResponse = await axios.get(`${API_URL}/courses/${courseId}/lessons`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLessons(lessonsResponse.data.data.lessons);
        }
        
        // If editing, fetch assignment details
        if (assignmentId) {
          const assignmentResponse = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const assignment = assignmentResponse.data.data.assignment;
          setFormData({
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
            totalPoints: assignment.totalPoints,
            isPublished: assignment.isPublished,
            lesson: assignment.lesson?._id || ''
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, assignmentId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data to send
      const assignmentData = {
        ...formData,
        course: courseId // Ensure the assignment is associated with the course
      };
      
      if (assignmentId) {
        // Update existing assignment
        await axios.patch(`${API_URL}/assignments/${assignmentId}`, assignmentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        navigate(`/assignments/${assignmentId}`);
      } else {
        // Create new assignment
        let endpoint = `${API_URL}/assignments`;
        
        // If we have a lesson ID, use the lesson-specific endpoint
        if (lessonId) {
          endpoint = `${API_URL}/lessons/${lessonId}/assignments`;
        } else if (courseId) {
          endpoint = `${API_URL}/courses/${courseId}/assignments`;
        }
        
        const response = await axios.post(endpoint, assignmentData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        navigate(`/assignments/${response.data.data.assignment._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              {assignmentId ? 'Edit Assignment' : 'Create New Assignment'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </Form.Group>
                
                {lessons.length > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Label>Lesson (optional)</Form.Label>
                    <Form.Select
                      name="lesson"
                      value={formData.lesson}
                      onChange={handleChange}
                    >
                      <option value="">-- Select a Lesson --</option>
                      {lessons.map(lesson => (
                        <option key={lesson._id} value={lesson._id}>
                          {lesson.title}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Associate this assignment with a specific lesson
                    </Form.Text>
                  </Form.Group>
                )}
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Due Date (optional)</Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Total Points</Form.Label>
                      <Form.Control
                        type="number"
                        name="totalPoints"
                        value={formData.totalPoints}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isPublished"
                    id="publishedCheckbox"
                    label="Publish Assignment (make it visible to students)"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(courseId ? `/courses/${courseId}` : '/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (assignmentId ? 'Update Assignment' : 'Create Assignment')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentForm;