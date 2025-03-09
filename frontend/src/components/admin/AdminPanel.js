import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Card, Table, Button, Badge, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch users
        const usersResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data.data.users);
        
        // Fetch courses
        const coursesResponse = await axios.get(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesResponse.data.data.courses);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load admin data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openUserModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setCurrentUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'student'
      });
    }
    setShowUserModal(true);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsCreatingUser(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (currentUser) {
        // Update existing user
        const updateData = { ...userForm };
        if (!updateData.password) delete updateData.password;
        
        await axios.patch(`${API_URL}/users/${currentUser._id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update users list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === currentUser._id 
              ? { ...user, name: userForm.name, email: userForm.email, role: userForm.role }
              : user
          )
        );
      } else {
        // Create new user
        const response = await axios.post(`${API_URL}/users/signup`, userForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Add to users list
        setUsers(prevUsers => [...prevUsers, response.data.data.user]);
      }
      
      setShowUserModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from users list
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from courses list
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tab.Container id="admin-tabs" defaultActiveKey="users">
        <Row>
          <Col md={3}>
            <Card className="mb-4">
              <Card.Header>Admin Menu</Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="users">Users</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="courses">Courses</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="settings">Settings</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="users">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">User Management</h5>
                    <Button variant="primary" size="sm" onClick={() => openUserModal()}>
                      <i className="bi bi-person-plus me-1"></i> Add User
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <Badge 
                                bg={
                                  user.role === 'admin' 
                                    ? 'danger' 
                                    : user.role === 'instructor' 
                                      ? 'primary' 
                                      : 'secondary'
                                }
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => openUserModal(user)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => deleteUser(user._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              <Tab.Pane eventKey="courses">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Course Management</h5>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate('/courses/create')}
                    >
                      <i className="bi bi-plus-circle me-1"></i> Add Course
                    </Button>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Instructor</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Enrollments</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(course => (
                          <tr key={course._id}>
                            <td>{course.title}</td>
                            <td>{course.instructor.name}</td>
                            <td className="text-capitalize">{course.category}</td>
                            <td>
                              {course.published ? (
                                <Badge bg="success">Published</Badge>
                              ) : (
                                <Badge bg="secondary">Draft</Badge>
                              )}
                            </td>
                            <td>{course.enrollments?.length || 0}</td>
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
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => deleteCourse(course._id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              <Tab.Pane eventKey="settings">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Platform Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-muted">
                      System settings would be configured here. This is a placeholder for future functionality.
                    </p>
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      This section is under development.
                    </Alert>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
      
      {/* User Create/Edit Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentUser ? 'Edit User' : 'Create New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userForm.name}
                onChange={handleUserFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userForm.email}
                onChange={handleUserFormChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                required={!currentUser}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={userForm.role}
                onChange={handleUserFormChange}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isCreatingUser}
              >
                {isCreatingUser ? 'Saving...' : (currentUser ? 'Save Changes' : 'Create User')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminPanel;