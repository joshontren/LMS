const Lesson = require('../models/lessonModel');
const Course = require('../models/courseModel');

// Get all lessons
exports.getAllLessons = async (req, res) => {
  try {
    let filter = {};
    
    // If courseId is specified, filter by course
    if (req.params.courseId) {
      filter = { course: req.params.courseId };
    }

    const lessons = await Lesson.find(filter).sort('order');

    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: {
        lessons
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get a single lesson
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Check if user is enrolled in the course or is the instructor/admin
    const course = await Course.findById(lesson.course._id);
    
    const isEnrolled = course.enrollments.some(
      enrollment => enrollment.user.toString() === req.user._id.toString()
    );
    
    const isInstructor = course.instructor._id.toString() === req.user._id.toString();
    
    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not enrolled in this course'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lesson
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create a new lesson
exports.createLesson = async (req, res) => {
  try {
    // If courseId is coming from the URL, use it
    if (req.params.courseId) {
      req.body.course = req.params.courseId;
    }

    // Check if course exists
    const course = await Course.findById(req.body.course);
    
    if (!course) {
      return res.status(404).json({
        status: 'fail',
        message: 'No course found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to add lessons to this course'
      });
    }

    // Get the count of existing lessons to set the order
    const lessonCount = await Lesson.countDocuments({ course: req.body.course });
    
    // Set the order if not provided
    if (!req.body.order) {
      req.body.order = lessonCount + 1;
    }

    const newLesson = await Lesson.create(req.body);

    // Add the lesson to the course
    await Course.findByIdAndUpdate(req.body.course, {
      $push: { lessons: newLesson._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        lesson: newLesson
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update a lesson
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    const course = await Course.findById(lesson.course._id);
    
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this lesson'
      });
    }

    // Update the updatedAt field
    req.body.updatedAt = Date.now();

    const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        lesson: updatedLesson
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete a lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        status: 'fail',
        message: 'No lesson found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    const course = await Course.findById(lesson.course._id);
    
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this lesson'
      });
    }

    // Remove the lesson from the course
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: req.params.id }
    });

    // Delete the lesson
    await Lesson.findByIdAndDelete(req.params.id);

    // Reorder other lessons
    const remainingLessons = await Lesson.find({ 
      course: lesson.course._id,
      order: { $gt: lesson.order }
    });

    for (const remainingLesson of remainingLessons) {
      await Lesson.findByIdAndUpdate(remainingLesson._id, {
        order: remainingLesson.order - 1
      });
    }

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