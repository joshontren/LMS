import React, { useState, useEffect } from 'react';
import { Card, Container, Table, Badge, Spinner, Alert, Form, Button, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

const Gradebook = ({ courseId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        let assignmentsUrl = `${API_URL}/assignments`;
        if (courseId) {
          assignmentsUrl = `${API_URL}/courses/${courseId}/assignments`;
        }
        
        const assignmentsResponse = await axios.get(assignmentsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAssignments(assignmentsResponse.data.data.assignments);
        
        // If student, organize submissions
        if (user.role === 'student') {
          const userSubmissions = [];
          
          assignmentsResponse.data.data.assignments.forEach(assignment => {
            const studentSubmission = assignment.submissions.find(
              sub => sub.student === user._id
            );
            
            userSubmissions.push({
              assignmentId: assignment._id,
              assignmentTitle: assignment.title,
              dueDate: assignment.dueDate,
              totalPoints: assignment.totalPoints,
              submission: studentSubmission || null
            });
          });
          
          setSubmissions(userSubmissions);
        } 
        // If instructor, get all submissions
        else if (user.role === 'instructor' || user.role === 'admin') {
          const allSubmissions = [];
          
          assignmentsResponse.data.data.assignments.forEach(assignment => {
            assignment.submissions.forEach(submission => {
              allSubmissions.push({
                assignmentId: assignment._id,
                assignmentTitle: assignment.title,
                totalPoints: assignment.totalPoints,
                submission
              });
            });
          });
          
          setSubmissions(allSubmissions);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load grade data');
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user]);

  const openGradeModal = (submission) => {
    setCurrentSubmission(submission);
    setGrade(submission.submission.grade || '');
    setFeedback(submission.submission.feedback || '');
    setShowGradeModal(true);
  };

  const handleSubmitGrade = async () => {
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/assignments/${currentSubmission.assignmentId}/grade/${currentSubmission.submission._id}`,
        { grade, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => {
          if (sub.assignmentId === currentSubmission.assignmentId && 
              sub.submission._id === currentSubmission.submission._id) {
            return {
              ...sub,
              submission: {
                ...sub.submission,
                grade,
                feedback,
                isGraded: true
              }
            };
          }
          return sub;
        })
      );
      
      setShowGradeModal(false);
    } catch (err) {
      setError('Failed to submit grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  // Render student view
  if (user.role === 'student') {
    return (
      <Card>
        <Card.Header as="h5">My Grades</Card.Header>
        <Card.Body className="p-0">
          {error && <Alert variant="danger">{error}</Alert>}
          
          {submissions.length === 0 ? (
            <Alert variant="info" className="m-3">
              No assignments found for this course.
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((item, index) => (
                  <tr key={index}>
                    <td>{item.assignmentTitle}</td>
                    <td>
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'No due date'}
                    </td>
                    <td>
                      {!item.submission ? (
                        <Badge bg="warning">Not Submitted</Badge>
                      ) : item.submission.isGraded ? (
                        <Badge bg="success">Graded</Badge>
                      ) : (
                        <Badge bg="info">Submitted</Badge>
                      )}
                    </td>
                    <td>
                      {item.submission && item.submission.isGraded ? (
                        <span>
                          {item.submission.grade} / {item.totalPoints}
                          <span className="ms-2">
                            ({Math.round((item.submission.grade / item.totalPoints) * 100)}%)
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => navigate(`/assignments/${item.assignmentId}`)}
                        >
                          View
                        </Button>
                        {!item.submission && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => navigate(`/assignments/${item.assignmentId}/submit`)}
                          >
                            Submit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    );
  }

  // Render instructor view
  return (
    <Card>
      <Card.Header as="h5">Student Submissions</Card.Header>
      <Card.Body className="p-0">
        {error && <Alert variant="danger">{error}</Alert>}
        
        {submissions.length === 0 ? (
          <Alert variant="info" className="m-3">
            No submissions found yet.
          </Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item, index) => (
                <tr key={index}>
                  <td>{item.submission.student.name || 'Student Name'}</td>
                  <td>{item.assignmentTitle}</td>
                  <td>
                    {new Date(item.submission.submissionDate).toLocaleDateString()}
                  </td>
                  <td>
                    {item.submission.isGraded ? (
                      <Badge bg="success">Graded</Badge>
                    ) : (
                      <Badge bg="warning">Needs Grading</Badge>
                    )}
                  </td>
                  <td>
                    {item.submission.isGraded ? (
                      <span>
                        {item.submission.grade} / {item.totalPoints}
                        <span className="ms-2">
                          ({Math.round((item.submission.grade / item.totalPoints) * 100)}%)
                        </span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate(`/assignments/${item.assignmentId}`)}
                      >
                        View Assignment
                      </Button>
                      <Button 
                        variant={item.submission.isGraded ? "outline-secondary" : "outline-success"} 
                        size="sm"
                        onClick={() => openGradeModal(item)}
                      >
                        {item.submission.isGraded ? 'Edit Grade' : 'Grade'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
      
      {/* Grading Modal */}
      <Modal show={showGradeModal} onHide={() => setShowGradeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Grade Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSubmission && (
            <>
              <p><strong>Assignment:</strong> {currentSubmission.assignmentTitle}</p>
              <p>
                <strong>Submitted by:</strong> {currentSubmission.submission.student.name || 'Student'}
              </p>
              <p>
                <strong>Submission Date:</strong> {new Date(currentSubmission.submission.submissionDate).toLocaleString()}
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Student's Work:</Form.Label>
                <div className="p-3 border rounded bg-light">
                  {currentSubmission.submission.content || 'No content submitted.'}
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Grade (out of {currentSubmission.totalPoints}):</Form.Label>
                <Form.Control
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max={currentSubmission.totalPoints}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Feedback:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGradeModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitGrade}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Grade'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Gradebook;