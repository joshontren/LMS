import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Button, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter to only show courses where the user is the instructor
        const instructorCourses = response.data.data.courses.filter(
          course => course.instructor._id === localStorage.getItem('userId')
        );
        
        setCourses(instructorCourses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStudentCount = (course) => {
    return course.enrollments?.length || 0;
  };

  const getLessonCount = (course) => {
    return course.lessons?.length || 0;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Instructor Dashboard</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/courses/create')}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Create New Course
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {courses.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <h3>You haven't created any courses yet</h3>
            <p className="text-muted">
              Get started by creating your first course to share your knowledge!
            </p>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/courses/create')}
            >
              Create Your First Course
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header as="h5">Your Courses</Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Students</th>
                  <th>Lessons</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>
                      <Link to={`/courses/${course._id}`} className="fw-bold text-decoration-none">
                        {course.title}
                      </Link>
                    </td>
                    <td className="text-capitalize">{course.category}</td>
                    <td>{getStudentCount(course)}</td>
                    <td>{getLessonCount(course)}</td>
                    <td>
                      {course.published ? (
                        <Badge bg="success">Published</Badge>
                      ) : (
                        <Badge bg="secondary">Draft</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/courses/${course._id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => navigate(`/courses/edit/${course._id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => navigate(`/courses/${course._id}/lesson/create`)}
                        >
                          Add Lesson
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Recent Activity</Card.Header>
            <Card.Body>
              <p className="text-muted">
                Student enrollments, completions, and other activities will appear here.
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header as="h5">Quick Stats</Card.Header>
            <Card.Body>
              <Row>
                <Col xs={6}>
                  <div className="text-center mb-3">
                    <h2>{courses.length}</h2>
                    <p className="text-muted mb-0">Total Courses</p>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="text-center mb-3">
                    <h2>
                      {courses.reduce((total, course) => total + getStudentCount(course), 0)}
                    </h2>
                    <p className="text-muted mb-0">Total Students</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InstructorDashboard;