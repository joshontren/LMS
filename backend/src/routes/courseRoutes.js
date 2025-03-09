const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

// Routes accessible by all authenticated users
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Enroll in a course (students only)
router.post('/:id/enroll', 
  authMiddleware.restrictTo('student', 'admin'),
  courseController.enrollCourse
);

// Routes for course creation/management (instructors and admins only)
router.post('/', 
  authMiddleware.restrictTo('instructor', 'admin'),
  courseController.createCourse
);

router.route('/:id')
  .patch(
    authMiddleware.restrictTo('instructor', 'admin'),
    courseController.updateCourse
  )
  .delete(
    authMiddleware.restrictTo('instructor', 'admin'),
    courseController.deleteCourse
  );

module.exports = router;