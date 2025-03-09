import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  Drawer,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getLessonById } from '../services/lessonService';
import { getCourseById } from '../services/courseService';
import { getAssignments } from '../services/assignmentService';

const LessonDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [progress, setProgress] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const sidebarWidth = 320;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get the lesson data
        const lessonResponse = await getLessonById(id);
        const lessonData = lessonResponse.data.lesson;
        setLesson(lessonData);
        
        // Get the course data
        const courseResponse = await getCourseById(lessonData.course._id);
        const courseData = courseResponse.data.course;
        setCourse(courseData);
        
        // Sort lessons by order
        const sortedLessons = courseData.lessons.sort((a, b) => a.order - b.order);
        setCourseLessons(sortedLessons);
        
        // Find current lesson index
        const index = sortedLessons.findIndex(l => l._id === id);
        setCurrentLessonIndex(index !== -1 ? index : 0);
        
        // Get assignments for this lesson
        const assignmentsResponse = await getAssignments({ lesson: id });
        setAssignments(assignmentsResponse.data.assignments);
        
        // Calculate progress
        if (courseData.enrollments && user) {
          const userEnrollment = courseData.enrollments.find(
            enrollment => enrollment.user === user._id
          );
          
          if (userEnrollment) {
            setProgress(userEnrollment.progress);
          }
        }
        
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        setError('Failed to load lesson content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      navigate('/login', { state: { from: `/lessons/${id}` } });
    }
  }, [id, isAuthenticated, user, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < courseLessons.length - 1) {
      navigate(`/lessons/${courseLessons[currentLessonIndex + 1]._id}`);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      navigate(`/lessons/${courseLessons[currentLessonIndex - 1]._id}`);
    }
  };

  // Determine if this is an instructor or student view
  const isInstructor = course?.instructor?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isInstructor || isAdmin;

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

  if (!lesson || !course) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Lesson not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default }}>
      {/* Course Content Sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={sidebarOpen}
        onClose={toggleSidebar}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            position: 'relative',
            height: '100%',
            border: 'none',
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2" fontWeight={600}>
              Course Content
            </Typography>
            {isMobile && (
              <IconButton onClick={toggleSidebar}>
                <ChevronLeftIcon />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {course.title}
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 6, borderRadius: 3, mt: 1 }}
          />
          <Typography variant="body2" sx={{ mt: 0.5, textAlign: 'right' }}>
            {progress}% complete
          </Typography>
        </Box>
        
        <List sx={{ py: 0 }}>
          {courseLessons.map((courseLesson, index) => (
            <React.Fragment key={courseLesson._id}>
              <ListItem
                button
                component={RouterLink}
                to={`/lessons/${courseLesson._id}`}
                selected={courseLesson._id === lesson._id}
                sx={{ 
                  py: 2,
                  bgcolor: courseLesson._id === lesson._id ? 'action.selected' : 'inherit',
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  },
                  borderLeft: courseLesson._id === lesson._id ? 
                    `4px solid ${theme.palette.primary.main}` : 
                    '4px solid transparent',
                }}
              >
                <ListItemIcon>
                  {courseLesson._id === lesson._id ? (
                    <PlayCircleFilledIcon color="primary" />
                  ) : (
                    <PlayCircleFilledIcon color="action" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={`${index + 1}. ${courseLesson.title}`}
                  primaryTypographyProps={{
                    fontWeight: courseLesson._id === lesson._id ? 600 : 400
                  }}
                  secondary={`${courseLesson.duration || 0} min`}
                />
              </ListItem>
              {index < courseLessons.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && !isMobile && {
            marginLeft: `${sidebarWidth}px`,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        {/* Top Navigation Bar */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton onClick={toggleSidebar} sx={{ mr: 1 }}>
                {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            )}
            <Button
              component={RouterLink}
              to={`/courses/${course._id}`}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2 }}
            >
              Back to Course
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              disabled={currentLessonIndex === 0}
              onClick={handlePreviousLesson}
              startIcon={<ChevronLeftIcon />}
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Button
              disabled={currentLessonIndex === courseLessons.length - 1}
              onClick={handleNextLesson}
              endIcon={<ChevronRightIcon />}
              variant="contained"
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Lesson Content */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {lesson.title}
            </Typography>
            
            {canEdit && (
              <Button
                startIcon={<EditIcon />}
                component={RouterLink}
                to={`/lessons/${lesson._id}/edit`}
                variant="outlined"
              >
                Edit Lesson
              </Button>
            )}
          </Box>
          
          {lesson.videoUrl && (
            <Box sx={{ position: 'relative', pt: '56.25%', mb: 3 }}>
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: theme.shape.borderRadius
                }}
                allowFullScreen
              />
            </Box>
          )}
          
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            {lesson.content}
          </Typography>
          
          {lesson.attachments && lesson.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Attachments
              </Typography>
              <List>
                {lesson.attachments.map((attachment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MenuBookIcon />
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
        
        {/* Related Assignments */}
        {assignments.length > 0 && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
              Assignments
            </Typography>
            
            <Grid container spacing={3}>
              {assignments.map((assignment) => (
                <Grid item xs={12} md={6} key={assignment._id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="h3">
                          {assignment.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {assignment.description.substring(0, 120)}...
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {assignment.dueDate && (
                          <Typography variant="body2" color="text.secondary">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        <Button
                          component={RouterLink}
                          to={`/assignments/${assignment._id}`}
                          variant="contained"
                          size="small"
                        >
                          View Assignment
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
        
        {/* Navigation Buttons (Footer) */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button
            disabled={currentLessonIndex === 0}
            onClick={handlePreviousLesson}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Previous Lesson
          </Button>
          
          <Button
            disabled={currentLessonIndex === courseLessons.length - 1}
            onClick={handleNextLesson}
            endIcon={<ArrowForwardIcon />}
            variant="contained"
          >
            Next Lesson
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LessonDetail;