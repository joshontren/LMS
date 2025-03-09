import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Rating,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Chip,
  Alert
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  School as SchoolIcon,
  SignalCellularAlt as SignalCellularAltIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getCourseById, enrollInCourse, deleteCourse } from '../services/courseService';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      aria-labelledby={`course-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CourseDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await getCourseById(id);
        setCourse(response.data.course);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEnrollCourse = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(id);
      setEnrollmentSuccess(true);
      
      // Refresh course data to update enrollment status
      const response = await getCourseById(id);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setError('Failed to enroll in the course. Please try again later.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        setDeleting(true);
        await deleteCourse(id);
        navigate('/courses');
      } catch (error) {
        console.error('Error deleting course:', error);
        setError('Failed to delete the course. Please try again later.');
        setDeleting(false);
      }
    }
  };

  // Check if user is enrolled
  const isEnrolled = course?.enrollments?.some(
    enrollment => user && enrollment.user === user._id
  );

  // Check if user is the instructor
  const isInstructor = course?.instructor?._id === user?._id;
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  if (!course) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Course not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Course Header */}
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          mb: 4,
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${course.coverImage || `https://source.unsplash.com/random/1200x400/?${course.category}`})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box>
              <Chip 
                label={course.category} 
                sx={{ textTransform: 'capitalize', mb: 2 }}
                color="primary"
              />
              <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
                {course.title}
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {course.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={course.rating} precision={0.5} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {course.rating.toFixed(1)} ({course.ratingsQuantity} ratings)
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src={course.instructor.profilePicture} 
                  alt={course.instructor.name}
                  sx={{ mr: 1 }}
                >
                  {course.instructor.name.charAt(0)}
                </Avatar>
                <Typography variant="body1">
                  Created by {course.instructor.name}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'text.primary' }}>
              <CardContent>
                <Typography variant="h4" component="div" gutterBottom color="primary.main" fontWeight={700}>
                  {course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}
                </Typography>
                
                {isEnrolled ? (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    component={RouterLink}
                    to={`/lessons/${course.lessons[0]?._id || ''}`}
                    disabled={course.lessons.length === 0}
                    sx={{ mb: 2 }}
                  >
                    {course.lessons.length > 0 ? 'Continue Learning' : 'No Lessons Available Yet'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleEnrollCourse}
                    disabled={enrolling || !course.published}
                    sx={{ mb: 2 }}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
                
                {enrollmentSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Successfully enrolled in the course!
                  </Alert>
                )}
                
                {!course.published && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    This course is not published yet.
                  </Alert>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  This course includes:
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PlayCircleFilledIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`${course.lessons.length} lessons`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AccessTimeIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`${course.duration || 0} hours of content`} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SignalCellularAltIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={`${course.level} level`} sx={{ textTransform: 'capitalize' }} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Full lifetime access" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SchoolIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Certificate of completion" />
                  </ListItem>
                </List>
                
                {(isInstructor || isAdmin) && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Instructor Options:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        component={RouterLink}
                        to={`/courses/${id}/edit`}
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteCourse}
                        disabled={deleting}
                        fullWidth
                      >
                        {deleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Content Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            mb: 2
          }}
        >
          <Tab label="Curriculum" />
          <Tab label="About" />
          <Tab label="Instructor" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Course Content
          </Typography>
          
          {course.lessons.length === 0 ? (
            <Alert severity="info">
              No lessons available yet. Please check back later.
            </Alert>
          ) : (
            <List component={Paper} sx={{ borderRadius: 2 }}>
              {course.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson, index) => (
                  <React.Fragment key={lesson._id}>
                    <ListItem 
                      button 
                      component={isEnrolled ? RouterLink : 'div'}
                      to={isEnrolled ? `/lessons/${lesson._id}` : undefined}
                      disabled={!isEnrolled && !isInstructor && !isAdmin}
                      sx={{ 
                        py: 2,
                        '&:hover': {
                          backgroundColor: isEnrolled ? theme.palette.action.hover : 'inherit'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <PlayCircleFilledIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${index + 1}. ${lesson.title}`} 
                        secondary={`Duration: ${lesson.duration || 0} minutes`}
                      />
                      {!isEnrolled && !isInstructor && !isAdmin && (
                        <Chip label="Preview" size="small" color="primary" sx={{ ml: 1 }} />
                      )}
                    </ListItem>
                    {index < course.lessons.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            About this Course
          </Typography>
          
          <Typography variant="body1" paragraph>
            {course.description}
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                What you'll learn
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Comprehensive understanding of the subject" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Practical skills you can apply immediately" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Industry best practices and techniques" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Expert insights and real-world examples" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Course Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Duration" 
                    secondary={`${course.duration || 0} hours of content`} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SignalCellularAltIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Level" 
                    secondary={course.level} 
                    secondaryTypographyProps={{ sx: { textTransform: 'capitalize' } }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Created On" 
                    secondary={formatDate(course.createdAt)} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Students Enrolled" 
                    secondary={course.enrollments.length} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
            Instructor
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={course.instructor.profilePicture} 
              alt={course.instructor.name}
              sx={{ width: 80, height: 80, mr: 3 }}
            >
              {course.instructor.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {course.instructor.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {course.instructor.role && course.instructor.role.charAt(0).toUpperCase() + course.instructor.role.slice(1)}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph>
            {course.instructor.bio || 
              `${course.instructor.name} is a passionate educator with extensive experience in ${course.category}. 
              They have created multiple courses to help students master this subject.`}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to={`/instructors/${course.instructor._id}`}
            >
              View Profile
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to={`/courses?instructor=${course.instructor._id}`}
            >
              View All Courses
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CourseDetail;