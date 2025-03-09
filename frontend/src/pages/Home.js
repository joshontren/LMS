import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
  useTheme,
  Chip,
  Rating,
  Avatar,
  Divider
} from '@mui/material';
import {
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { getCourses } from '../services/courseService';

const Home = () => {
  const theme = useTheme();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        // Get courses with highest ratings
        const response = await getCourses({ limit: 4, sort: '-rating' });
        setFeaturedCourses(response.data.courses);
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  // Stats for the platform
  const stats = [
    { 
      icon: <SchoolIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />, 
      count: '500+', 
      label: 'Courses' 
    },
    { 
      icon: <GroupIcon fontSize="large" sx={{ color: theme.palette.secondary.main }} />, 
      count: '10,000+', 
      label: 'Students' 
    },
    { 
      icon: <TimelineIcon fontSize="large" sx={{ color: theme.palette.success.main }} />, 
      count: '95%', 
      label: 'Completion Rate' 
    }
  ];

  // Categories
  const categories = [
    { name: 'Programming', count: 120 },
    { name: 'Design', count: 85 },
    { name: 'Business', count: 65 },
    { name: 'Marketing', count: 50 },
    { name: 'Science', count: 45 },
    { name: 'Language', count: 30 }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '500px', md: '600px' },
          backgroundColor: theme.palette.primary.dark,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #3f51b5 0%, #002984 100%)',
          mb: 8,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Learn Without Limits
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4, 
                    opacity: 0.9,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  Access interactive courses led by expert instructors in various fields.
                </Typography>
                <Box sx={{ '& > button': { mr: 2, mb: 2 } }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={RouterLink}
                    to="/courses"
                    sx={{
                      py: 1.5,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Explore Courses
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.5,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                    component={RouterLink}
                    to="/register"
                  >
                    Get Started
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              {/* Hero image or illustration can go here */}
              <Box
                sx={{
                  position: 'relative',
                  height: '400px',
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {/* This is a placeholder, you would replace with an actual image */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: 'url(https://source.unsplash.com/random/600x400/?education) center/cover'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: 1,
                  height: '100%'
                }}
              >
                {stat.icon}
                <Typography variant="h3" component="p" sx={{ mt: 2, fontWeight: 700 }}>
                  {stat.count}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Featured Courses Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Featured Courses
            </Typography>
            <Button 
              component={RouterLink} 
              to="/courses"
              variant="outlined"
              color="primary"
            >
              View All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {loading ? (
              // Placeholders while loading
              [...Array(4)].map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ 
                      height: 140, 
                      backgroundColor: theme.palette.grey[200],
                      animation: 'pulse 1.5s infinite ease-in-out'
                    }} />
                    <CardContent>
                      <Box 
                        sx={{ 
                          height: 24, 
                          width: '80%', 
                          backgroundColor: theme.palette.grey[200],
                          mb: 1,
                          animation: 'pulse 1.5s infinite ease-in-out'
                        }} 
                      />
                      <Box 
                        sx={{ 
                          height: 16, 
                          width: '60%', 
                          backgroundColor: theme.palette.grey[200],
                          animation: 'pulse 1.5s infinite ease-in-out'
                        }} 
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              // Actual courses
              featuredCourses.map((course) => (
                <Grid item xs={12} sm={6} md={3} key={course._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      },
                      textDecoration: 'none'
                    }}
                    component={RouterLink}
                    to={`/courses/${course._id}`}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                          src={course.instructor.profilePicture} 
                          alt={course.instructor.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        >
                          {course.instructor.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" color="text.secondary">
                          {course.instructor.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={course.rating} precision={0.5} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({course.ratingsQuantity})
                          </Typography>
                        </Box>
                        {course.price > 0 ? (
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            ${course.price.toFixed(2)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            Free
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Categories Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" fontWeight={600} sx={{ mb: 4 }}>
            Browse by Category
          </Typography>
          
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={2} key={category.name}>
                <Button
                  component={RouterLink}
                  to={`/courses?category=${category.name.toLowerCase()}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    textTransform: 'none',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: 'rgba(63, 81, 181, 0.04)'
                    }
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.count} courses
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" fontWeight={600} sx={{ mb: 4, textAlign: 'center' }}>
            Why Choose LearningHub?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <SchoolIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Expert Instructors
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Learn from industry professionals with years of practical experience.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <TimelineIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Self-Paced Learning
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Study at your own pace with lifetime access to purchased courses.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Certification
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Earn certificates upon completion to showcase your new skills.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box 
          sx={{ 
            mb: 8, 
            py: 6, 
            px: 4, 
            borderRadius: 2, 
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
            Ready to start learning?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of students who are already learning and growing their skills on our platform.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Sign Up Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;