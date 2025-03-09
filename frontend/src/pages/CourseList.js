import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Rating,
  Select,
  TextField,
  Typography,
  useTheme,
  Chip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';
import { getCourses } from '../services/courseService';

const CourseList = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Categories
  const categories = [
    'All Categories',
    'Programming',
    'Design',
    'Business',
    'Marketing',
    'Science',
    'Language'
  ];

  // Levels
  const levels = [
    'All Levels',
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'highest_rated', label: 'Highest Rated' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' }
  ];

  // Parse query parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    if (params.has('search')) setSearchTerm(params.get('search'));
    if (params.has('category')) setCategory(params.get('category'));
    if (params.has('level')) setLevel(params.get('level'));
    if (params.has('sort')) setSortBy(params.get('sort'));
    if (params.has('page')) setPage(parseInt(params.get('page'), 10));
    
    // Fetch courses with these parameters
    fetchCourses();
  }, [location.search]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams(location.search);
      
      // Add pagination
      const limit = 9; // Courses per page
      params.set('limit', limit);
      params.set('page', page);
      
      // Set sort parameter based on sortBy
      switch (sortBy) {
        case 'newest':
          params.set('sort', '-createdAt');
          break;
        case 'popular':
          params.set('sort', '-ratingsQuantity');
          break;
        case 'highest_rated':
          params.set('sort', '-rating');
          break;
        case 'price_low_high':
          params.set('sort', 'price');
          break;
        case 'price_high_low':
          params.set('sort', '-price');
          break;
        default:
          params.set('sort', '-createdAt');
      }
      
      // Call API
      const response = await getCourses(Object.fromEntries(params));
      
      setCourses(response.data.courses);
      
      // Calculate total pages
      const totalCount = response.data.results;
      setTotalPages(Math.ceil(totalCount / limit));
      
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFiltersChange = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (category && category !== 'All Categories') params.set('category', category.toLowerCase());
    if (level && level !== 'All Levels') params.set('level', level.toLowerCase());
    if (sortBy) params.set('sort', sortBy);
    params.set('page', '1'); // Reset to first page on filter change
    
    navigate({ search: params.toString() });
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFiltersChange();
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(location.search);
    params.set('page', value);
    navigate({ search: params.toString() });
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Courses
          </Typography>
          
          {user && (user.role === 'instructor' || user.role === 'admin') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/courses/create"
            >
              Create Course
            </Button>
          )}
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Browse our wide variety of courses to enhance your skills
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  label="Level"
                >
                  {levels.map((lvl) => (
                    <MenuItem key={lvl} value={lvl}>
                      {lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<FilterListIcon />}
                onClick={handleFiltersChange}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Course List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search or filter to find what you're looking for.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              navigate('/courses');
              setSearchTerm('');
              setCategory('');
              setLevel('');
              setSortBy('newest');
            }}
          >
            Clear All Filters
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {courses.map((course) => (
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
                    height="160"
                    image={course.coverImage || `https://source.unsplash.com/random/300x200/?${course.category}`}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={course.category} 
                        size="small" 
                        sx={{ textTransform: 'capitalize' }}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={course.level} 
                        size="small" 
                        sx={{ textTransform: 'capitalize' }}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography gutterBottom variant="h6" component="h2" sx={{ mb: 1 }}>
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
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                      {course.description.substring(0, 85)}...
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
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
            ))}
          </Grid>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default CourseList;