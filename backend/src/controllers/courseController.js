const Course = require('../models/courseModel');
const User = require('../models/userModel');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Course.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Filter published courses only for students
    if (req.user && req.user.role === 'student') {
      query = query.find({ published: true });
    }

    // Execute query
    const courses = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: courses.length,
      data: {
        courses
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get one course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'lessons',
      select: 'title duration order'
    });

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if the course is published or if the user is the instructor or admin
    if (!course.published && 
        req.user.role !== 'admin' && 
        course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'This course is not published yet'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    // Add instructor to course
    req.body.instructor = req.user._id;

    const newCourse = await Course.create(req.body);

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: newCourse._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        course: newCourse
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && 
        course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to edit this course'
      });
    }

    // Update the updatedAt field
    req.body.updatedAt = Date.now();

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        course: updatedCourse
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if user is the instructor or admin
    if (req.user.role !== 'admin' && 
        course.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this course'
      });
    }

    // Remove course from all users who have it
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id } }
    );

    // Remove course from instructor's created courses
    await User.updateMany(
      { createdCourses: req.params.id },
      { $pull: { createdCourses: req.params.id } }
    );

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if the course is published
    if (!course.published) {
      return res.status(403).json({
        status: 'fail',
        message: 'This course is not published yet'
      });
    }

    // Check if user is already enrolled
    const alreadyEnrolled = await Course.findOne({
      _id: req.params.id,
      'enrollments.user': req.user._id
    });

    if (alreadyEnrolled) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already enrolled in this course'
      });
    }

    // Add user to course enrollments
    course.enrollments.push({
      user: req.user._id,
      enrollmentDate: Date.now()
    });
    await course.save();

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: {
        course
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};