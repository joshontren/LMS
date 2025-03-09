import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const CourseForm = () => {
  const { id } = useParams(); // If editing an existing course
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(id ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    duration: '',
    price: 0,
    coverImage: '',
    published: false
  });

  useEffect(() => {
    // If we have an ID, this is an edit operation
    if (id) {
      const fetchCourse = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${API_URL}/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const course = response.data.data.course;
          setFormData({
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration || '',
            price: course.price,
            coverImage: course.coverImage || '',
            published: course.published
          });
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load course information');
          setIsLoading(false);
        }
      };

      fetchCourse();
    }
  }, [id]);

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
      
      if (id) {
        // Update existing course
        await axios.patch(`${API_URL}/courses/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/courses/${id}`);
      } else {
        // Create new course
        const response = await axios.post(`${API_URL}/courses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/courses/${response.data.data.course._id}`);
      }
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
              {id ? 'Edit Course' : 'Create New Course'}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Title</Form.Label>
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
                    rows={4}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange}
                      >
                        <option value="programming">Programming</option>
                        <option value="design">Design</option>
                        <option value="business">Business</option>
                        <option value="marketing">Marketing</option>
                        <option value="science">Science</option>
                        <option value="language">Language</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Level</Form.Label>
                      <Form.Select 
                        name="level" 
                        value={formData.level} 
                        onChange={handleChange}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration (hours)</Form.Label>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cover Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="published"
                    id="publishedCheckbox"
                    label="Publish Course (make it visible to students)"
                    checked={formData.published}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : (id ? 'Update Course' : 'Create Course')}
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

export default CourseForm;