import React, { useState, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon
} from '@mui/icons-material';
import AuthContext from '../contexts/AuthContext';

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['student', 'instructor'], 'Invalid role')
    .required('Please select a role')
});

const Register = () => {
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setRegisterError('');
    
    // Remove confirmPassword from values before sending to API
    const { confirmPassword, ...userData } = values;
    
    const success = await register(userData);
    if (success) {
      navigate('/dashboard');
    } else {
      setRegisterError(error || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        py: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SchoolIcon
              sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h4" component="h1" fontWeight={600}>
              Create an Account
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              Join LearningHub to start your learning journey
            </Typography>
          </Box>

          {registerError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {registerError}
            </Alert>
          )}

          <Formik
            initialValues={{ 
              name: '', 
              email: '', 
              password: '', 
              confirmPassword: '',
              role: 'student'
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  name="name"
                  label="Full Name"
                  margin="normal"
                  error={errors.name && touched.name}
                  helperText={touched.name && errors.name}
                  sx={{ mb: 2 }}
                />

                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email Address"
                  margin="normal"
                  type="email"
                  error={errors.email && touched.email}
                  helperText={touched.email && errors.email}
                  sx={{ mb: 2 }}
                />

                <Field
                  as={TextField}
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={errors.password && touched.password}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />

                <Field
                  as={TextField}
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={errors.confirmPassword && touched.confirmPassword}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  sx={{ mb: 2 }}
                />

                <FormControl 
                  fullWidth 
                  margin="normal" 
                  error={errors.role && touched.role}
                  sx={{ mb: 3 }}
                >
                  <InputLabel id="role-label">Join as</InputLabel>
                  <Field
                    as={Select}
                    labelId="role-label"
                    name="role"
                    label="Join as"
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                  </Field>
                  {touched.role && errors.role && (
                    <FormHelperText>{errors.role}</FormHelperText>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    mb: 3,
                    position: 'relative'
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px'
                      }}
                    />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </Form>
            )}
          </Formik>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  fontWeight: 500,
                  backgroundColor: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <Box component="img" src="/google-icon.png" sx={{ width: 20, height: 20, mr: 1 }} />
                Sign up with Google
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                fontWeight={600}
                color="primary.main"
                underline="hover"
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;