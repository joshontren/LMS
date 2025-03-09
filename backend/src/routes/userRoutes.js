const express = require('express');
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Protected routes
router.use(authMiddleware.protect);

router.get('/me', authMiddleware.getMe, userController.getUser);
router.patch('/updateMe', authMiddleware.getMe, userController.updateUser);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;