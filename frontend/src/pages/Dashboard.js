import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  useTheme,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Announcement as AnnouncementIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getCourses } from '../services/courseService';
import { getAssignments } from '../services/assignmentService';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Simulated recent activity data - in a real app, this would come from an API
  const mockRecentActivity = [
    { 
      id: 1, 
      type: 'course_progress', 
      message: 'You completed lesson 3 in JavaScript Fundamentals', 
      date: '2023-10-15T14:30:00Z',
      icon: <PlayCircleOutlineIcon />
    },
    { 
      id: 2, 
      type: 'assignment_completed', 
      message: 'Your assignment "CSS Layouts" was graded: 95%', 
      date: '2023-10-14T10:15:00Z',
      icon: <CheckCircleIcon />
    },
    { 
      id: 3, 
      type: 'announcement', 
      message: 'New course material added to React Basics', 
      date: '2023-10-13T16:45:00Z',
      icon: <AnnouncementIcon />
    },
    { 
      id: 4, 
      type: 'assignment_due', 
      message: 'Assignment "Database Design" is due tomorrow', 
      date: '2023-10-12T09:00:00Z',
      icon: <ScheduleIcon />
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrolled courses
        const coursesResponse = await getCourses();
        
        // Filter courses based on user's enrollments
        const userCourses = user?.role === 'student'
          ? coursesResponse.data.courses.filter(course => 
              course.enrollments.some(enrollment => 
                enrollment.user === user._id
              )
            )
          : coursesResponse.data.courses.filter(course => 
              course.instructor._id === user._id
            );
            
        setEnrolledCourses(userCourses);
        
        // Fetch pending assignments
        const assignmentsResponse = await getAssignments();
        
        // Filter assignments based on user's role
        const userAssignments = user?.role === 'student'
          ? assignmentsResponse.data.assignments.filter(assignment => 
              !assignment.submissions.some(submission => 
                submission.student === user._id
              )
            )
          : assignmentsResponse.data.assignments.filter(assignment => 
              assignment.submissions.some(submission => 
                !submission.isGraded
              )
            );
            
        setPendingAssignments(userAssignments);
        
        // Set mock recent activity
        setRecentActivity(mockRecentActivity);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}! Here's an overview of your learning journey.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {/* My Courses Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h2" fontWeight={600}>
                {user?.role === 'student' ? 'My Courses' : 'My Teaching Courses'}
              </Typography>
              <Button 
                component={RouterLink} 
                to="/courses"
                color="primary"
              >
                View All
              </Button>
            </Box>

            {enrolledCourses.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {user?.role === 'student' 
                    ? "You haven't enrolled in any courses yet." 
                    : "You haven't created any courses yet."}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  component={RouterLink}
                  to={user?.role === 'student' ? '/courses' : '/courses/create'}
                >
                  {user?.role === 'student' ? 'Browse Courses' : 'Create Course'}
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {enrolledCourses.slice(0, 3).map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course._id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                        }
                      }}
                      component={RouterLink}
                      to={`/courses/${course._id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.coverImage || `https://source.unsplash.com/random/300x200/?${course.category}`}
                        alt={course.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Chip 
                          label={course.category} 
                          size="small" 
                          sx={{ mb: 1, textTransform: 'capitalize' }}
                          color="primary"
                          variant="outlined"
                        />
                        <Typography gutterBottom variant="h6" component="h3">
                          {course.title}
                        </Typography>
                        
                        {user?.role === 'student' && (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Progress
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={course.enrollments.find(e => e.user === user._id)?.progress || 0}
                              sx={{ mb: 1, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2" fontWeight={500} align="right">
                              {course.enrollments.find(e => e.user === user._id)?.progress || 0}%
                            </Typography>
                          </>
                        )}
                        
                        {user?.role === 'instructor' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {course.enrollments.length} students enrolled
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.published ? 'Published' : 'Draft'}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* Pending Assignments Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 2 }}>
              {user?.role === 'student' ? 'Pending Assignments' : 'Assignments to Grade'}
            </Typography>

            {pendingAssignments.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {user?.role === 'student' 
                    ? "You don't have any pending assignments." 
                    : "You don't have any assignments to grade."}
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 2 }}>
                <List>
                  {pendingAssignments.slice(0, 4).map((assignment, index) => (
                    <React.Fragment key={assignment._id}>
                      <ListItem 
                        component={RouterLink}
                        to={`/assignments/${assignment._id}`}
                        sx={{ 
                          py: 2,
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ backgroundColor: theme.palette.secondary.main }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={assignment.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {assignment.course.title}
                              </Typography>
                              {assignment.dueDate && (
                                <Typography component="span" variant="body2" display="block">
                                  Due: {formatDate(assignment.dueDate)}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <Chip 
                          label={user?.role === 'student' ? 'Submit' : 'Grade'} 
                          color="primary" 
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </ListItem>
                      {index < pendingAssignments.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
                {pendingAssignments.length > 4 && (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button 
                      component={RouterLink} 
                      to="/assignments"
                      color="primary"
                    >
                      View All Assignments
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* User Stats */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar 
                src={user?.profilePicture} 
                alt={user?.name}
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
              >
                {user?.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" component="h3" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {user?.role}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" component="p" fontWeight={600}>
                    {enrolledCourses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'student' ? 'Enrolled Courses' : 'Teaching Courses'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" component="p" fontWeight={600}>
                    {pendingAssignments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.role === 'student' ? 'Pending Assignments' : 'To Grade'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                fullWidth
                component={RouterLink}
                to="/profile"
              >
                View Profile
              </Button>
            </Box>
          </Paper>

          {/* Recent Activity */}
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" fontWeight={600} sx={{ mb: 2 }}>
              Recent Activity
            </Typography>

            <List sx={{ p: 0 }}>
              {recentActivity.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ backgroundColor: 'primary.main' }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.message}
                      secondary={formatDate(activity.date)}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;