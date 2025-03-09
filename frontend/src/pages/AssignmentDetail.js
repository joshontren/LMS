import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useTheme,
  Chip,
  Alert,
  Rating
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Grade as GradeIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getAssignmentById, submitAssignment, gradeAssignment } from '../services/assignmentService';

// Validation schema for submission
const SubmissionSchema = Yup.object().shape({
  content: Yup.string()
    .required('Content is required')
    .min(10, 'Content must be at least 10 characters')
});

// Validation schema for grading
const GradingSchema = Yup.object().shape({
  grade: Yup.number()
    .required('Grade is required')
    .min(0, 'Grade must be at least 0')
    .max(100, 'Grade cannot exceed 100'),
  feedback: Yup.string()
    .required('Feedback is required')
    .min(10, 'Feedback must be at least 10 characters')
});

const AssignmentDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [grading, setGrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        
        const response = await getAssignmentById(id);
        setAssignment(response.data.assignment);
        
      } catch (error) {
        console.error('Error fetching assignment data:', error);
        setError('Failed to load assignment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAssignmentData();
    } else {
      navigate('/login', { state: { from: `/assignments/${id}` } });
    }
  }, [id, isAuthenticated, navigate]);

  // Handle submission
  const handleSubmitAssignment = async (values, { resetForm }) => {
    try {
      setSubmitting(true);
      setError('');
      
      await submitAssignment(id, values);
      
      // Refresh assignment data
      const response = await getAssignmentById(id);
      setAssignment(response.data.assignment);
      
      setSuccessMessage('Assignment submitted successfully!');
      resetForm();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setError('Failed to submit assignment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle grading
  const handleGradeSubmission = async (values, { resetForm }) => {
    try {
      setGrading(true);
      setError('');
      
      await gradeAssignment(id, gradingSubmissionId, values);
      
      // Refresh assignment data
      const response = await getAssignmentById(id);
      setAssignment(response.data.assignment);
      
      setSuccessMessage('Assignment graded successfully!');
      setGradingSubmissionId(null);
      resetForm();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error grading assignment:', error);
      setError('Failed to grade assignment. Please try again later.');
    } finally {
      setGrading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user has submitted
  const userSubmission = assignment?.submissions?.find(
    submission => submission.student === user?._id
  );

  // Check if user is an instructor or admin
  const isInstructor = assignment?.course?.instructor?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canGrade = isInstructor || isAdmin;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Assignment not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Top navigation */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to={`/courses/${assignment.course._id}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Course
        </Button>
        
        {assignment.lesson && (
          <Button
            component={RouterLink}
            to={`/lessons/${assignment.lesson._id}`}
          >
            Back to Lesson
          </Button>
        )}
      </Box>

      {/* Success message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSuccessMessage('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {successMessage}
        </Alert>
      )}

      {/* Assignment Details */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight={600}>
              {assignment.title}
            </Typography>
          </Box>
          
          {canGrade && (
            <Button
              startIcon={<EditIcon />}
              component={RouterLink}
              to={`/assignments/${assignment._id}/edit`}
              variant="outlined"
            >
              Edit Assignment
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Chip 
            label={`Course: ${assignment.course.title}`} 
            variant="outlined"
          />
          {assignment.lesson && (
            <Chip 
              label={`Lesson: ${assignment.lesson.title}`} 
              variant="outlined"
            />
          )}
          <Chip 
            label={`Total Points: ${assignment.totalPoints}`} 
            variant="outlined" 
            color="primary"
          />
          {assignment.dueDate && (
            <Chip 
              label={`Due: ${formatDate(assignment.dueDate)}`} 
              variant="outlined"
              color={new Date() > new Date(assignment.dueDate) ? "error" : "default"}
            />
          )}
        </Box>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
          {assignment.description}
        </Typography>
        
        {assignment.attachments && assignment.attachments.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Attachments
            </Typography>
            <List>
              {assignment.attachments.map((attachment, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AttachFileIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={attachment.name} 
                    secondary={attachment.fileType} 
                  />
                  <Button
                    href={attachment.fileUrl}
                    target="_blank"
                    download
                    variant="outlined"
                    size="small"
                  >
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      {/* Student View - Submit Assignment */}
      {user?.role === 'student' && (
        <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            {userSubmission ? 'Your Submission' : 'Submit Assignment'}
          </Typography>
          
          {userSubmission ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Submitted on: {formatDate(userSubmission.submissionDate)}
              </Typography>
              
              <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="body1">
                    {userSubmission.content}
                  </Typography>
                </CardContent>
              </Card>
              
              {userSubmission.isGraded ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Feedback
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      Grade:
                    </Typography>
                    <Chip 
                      label={`${userSubmission.grade}/${assignment.totalPoints}`}
                      color={userSubmission.grade >= (assignment.totalPoints * 0.6) ? "success" : "error"}
                    />
                  </Box>
                  
                  <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent>
                      <Typography variant="body1">
                        {userSubmission.feedback}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ) : (
                <Alert severity="info">
                  Your submission has not been graded yet.
                </Alert>
              )}
              
              {!assignment.dueDate || new Date() < new Date(assignment.dueDate) ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    You can resubmit this assignment before the due date.
                  </Typography>
                  
                  <Formik
                    initialValues={{ content: userSubmission.content }}
                    validationSchema={SubmissionSchema}
                    onSubmit={handleSubmitAssignment}
                  >
                    {({ errors, touched, isValid }) => (
                      <Form>
                        <Field
                          as={TextField}
                          name="content"
                          label="Submission Content"
                          multiline
                          rows={6}
                          fullWidth
                          variant="outlined"
                          error={errors.content && touched.content}
                          helperText={touched.content && errors.content}
                          sx={{ mb: 2 }}
                        />
                        
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<CloudUploadIcon />}
                          disabled={submitting || !isValid}
                        >
                          {submitting ? 'Submitting...' : 'Resubmit Assignment'}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Box>
              ) : (
                <Alert severity="warning" sx={{ mt: 3 }}>
                  The due date has passed. You cannot resubmit this assignment.
                </Alert>
              )}
            </Box>
          ) : (
            <Box>
              {assignment.dueDate && new Date() > new Date(assignment.dueDate) ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  The due date has passed. You may still submit, but it will be marked as late.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please submit your work before the due date.
                </Alert>
              )}
              
              <Formik
                initialValues={{ content: '' }}
                validationSchema={SubmissionSchema}
                onSubmit={handleSubmitAssignment}
              >
                {({ errors, touched, isValid }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="content"
                      label="Submission Content"
                      multiline
                      rows={8}
                      fullWidth
                      variant="outlined"
                      error={errors.content && touched.content}
                      helperText={touched.content && errors.content}
                      sx={{ mb: 3 }}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SendIcon />}
                      disabled={submitting || !isValid}
                      size="large"
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Box>
          )}
        </Paper>
      )}

      {/* Instructor View - Grade Submissions */}
      {canGrade && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Student Submissions {assignment.submissions.length > 0 && `(${assignment.submissions.length})`}
          </Typography>
          
          {assignment.submissions.length === 0 ? (
            <Alert severity="info">
              There are no submissions for this assignment yet.
            </Alert>
          ) : (
            <List>
              {assignment.submissions.map((submission) => (
                <React.Fragment key={submission._id}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Student: {submission.student.name}
                        </Typography>
                        <Chip 
                          label={submission.isGraded ? 'Graded' : 'Not Graded'} 
                          color={submission.isGraded ? 'success' : 'default'}
                          icon={submission.isGraded ? <CheckIcon /> : undefined}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Submitted on: {formatDate(submission.submissionDate)}
                      </Typography>
                      
                      <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Typography variant="body1">
                            {submission.content}
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      {submission.isGraded ? (
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                              Grade:
                            </Typography>
                            <Chip 
                              label={`${submission.grade}/${assignment.totalPoints}`}
                              color={submission.grade >= (assignment.totalPoints * 0.6) ? "success" : "error"}
                            />
                          </Box>
                          
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                            Feedback:
                          </Typography>
                          <Typography variant="body1">
                            {submission.feedback}
                          </Typography>
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => setGradingSubmissionId(submission._id)}
                            sx={{ mt: 2 }}
                          >
                            Edit Grading
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<GradeIcon />}
                          onClick={() => setGradingSubmissionId(submission._id)}
                        >
                          Grade Submission
                        </Button>
                      )}
                      
                      {gradingSubmissionId === submission._id && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            {submission.isGraded ? 'Update Grading' : 'Grade Submission'}
                          </Typography>
                          
                          <Formik
                            initialValues={{ 
                              grade: submission.grade || '', 
                              feedback: submission.feedback || '' 
                            }}
                            validationSchema={GradingSchema}
                            onSubmit={handleGradeSubmission}
                          >
                            {({ errors, touched, isValid }) => (
                              <Form>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={4}>
                                    <Field
                                      as={TextField}
                                      name="grade"
                                      label={`Grade (out of ${assignment.totalPoints})`}
                                      type="number"
                                      fullWidth
                                      variant="outlined"
                                      error={errors.grade && touched.grade}
                                      helperText={touched.grade && errors.grade}
                                      InputProps={{ inputProps: { min: 0, max: assignment.totalPoints } }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={8}>
                                    <Field
                                      as={TextField}
                                      name="feedback"
                                      label="Feedback"
                                      multiline
                                      rows={4}
                                      fullWidth
                                      variant="outlined"
                                      error={errors.feedback && touched.feedback}
                                      helperText={touched.feedback && errors.feedback}
                                    />
                                  </Grid>
                                </Grid>
                                
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={grading || !isValid}
                                  >
                                    {grading ? 'Saving...' : 'Save Grading'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => setGradingSubmissionId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              </Form>
                            )}
                          </Formik>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                  <Divider sx={{ my: 3 }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default AssignmentDetail;