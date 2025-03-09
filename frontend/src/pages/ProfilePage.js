import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profilePicture: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile({
          name: res.data.data.user.name || '',
          email: res.data.data.user.email || '',
          bio: res.data.data.user.bio || '',
          profilePicture: res.data.data.user.profilePicture || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile information');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${API_URL}/users/updateMe`,
        { 
          name: profile.name,
          bio: profile.bio 
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      
      // Update user in context if needed
      if (updateUser) {
        updateUser(res.data.data.user);
      }
      
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header as="h4" className="bg-primary text-white">
              My Profile
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={4} className="text-center mb-4">
                    <div className="position-relative">
                      <img 
                        src={profile.profilePicture || 'https://via.placeholder.com/150'} 
                        alt="Profile" 
                        className="rounded-circle img-fluid mb-3"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                      {/* Profile picture upload functionality could be added here */}
                    </div>
                  </Col>
                  
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={profile.email}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Email cannot be changed.
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        rows={3}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="text-end mt-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Save Changes'}
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

export default ProfilePage;