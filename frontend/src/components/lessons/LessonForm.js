import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const LessonForm = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(lessonId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order: '',
    duration: '',
    videoUrl: '',
    isPublished: false
  });

  useEffect(() => {
    // If we have a lessonId, this is an edit operation
    if (lessonId) {
      const fetchLesson = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/lessons/${lessonId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const lesson = response.data.data.lesson;
          setFormData({
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            duration: lesson.duration || '',
            videoUrl: lesson.videoUrl || '',
            isPublished: lesson.isPublished
          });
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load lesson information');
          setIsLoading(false);
        }
      };

      fetchLesson();
    }
  }, [lessonId]);

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
      
      // Prepare the data to send
      const lessonData = {
        ...formData,
        course: courseId // Make sure the lesson is associated with the course
      };
      
      if (lessonId) {
        // Update existing lesson
        await axios.patch(`${API_URL}/lessons/${lessonId}`, lessonData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new lesson
        await axios.post(`${API_URL}/courses/${courseId}/lessons`, lessonData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Redirect to course detail page
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
              {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={8}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Order in Course</Form.Label>
                      <Form.Control
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                      <Form.Text className="text-muted">
                        Position of this lesson in the course (1, 2, 3, etc.)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Video URL (optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="isPublished"
                    id="publishedCheckbox"
                    label="Publish Lesson (make it visible to students)"
                    checked={formData.isPublished}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (lessonId ? 'Update Lesson' : 'Create Lesson')}
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

export default LessonForm;