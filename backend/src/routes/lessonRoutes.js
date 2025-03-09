const express = require('express');
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(authMiddleware.protect);

// Routes accessible to all authenticated users
router.get('/', lessonController.getAllLessons);
router.get('/:id', lessonController.getLesson);

// Routes for lesson creation/management (instructors and admins only)
router.post('/', 
  authMiddleware.restrictTo('instructor', 'admin'),
  lessonController.createLesson
);

router.route('/:id')
  .patch(
    authMiddleware.restrictTo('instructor', 'admin'),
    lessonController.updateLesson
  )
  .delete(
    authMiddleware.restrictTo('instructor', 'admin'),
    lessonController.deleteLesson
  );

module.exports = router;