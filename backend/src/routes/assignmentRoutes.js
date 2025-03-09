const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(authMiddleware.protect);

// Routes accessible to all authenticated users
router.get('/', assignmentController.getAllAssignments);
router.get('/:id', assignmentController.getAssignment);

// Submit assignment (students only)
router.post('/:id/submit',
  authMiddleware.restrictTo('student'),
  assignmentController.submitAssignment
);

// Grade assignment (instructors and admins only)
router.post('/:id/grade/:submissionId',
  authMiddleware.restrictTo('instructor', 'admin'),
  assignmentController.gradeAssignment
);

// Routes for assignment creation/management (instructors and admins only)
router.post('/',
  authMiddleware.restrictTo('instructor', 'admin'),
  assignmentController.createAssignment
);

router.route('/:id')
  .patch(
    authMiddleware.restrictTo('instructor', 'admin'),
    assignmentController.updateAssignment
  )
  .delete(
    authMiddleware.restrictTo('instructor', 'admin'),
    assignmentController.deleteAssignment
  );

module.exports = router;