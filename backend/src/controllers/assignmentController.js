const Assignment = require('../models/assignmentModel');
const Course = require('../models/courseModel');

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    let filter = {};
    
    // If courseId is specified, filter by course
    if (req.params.courseId) {
      filter = { course: req.params.courseId };
    }

    // If lessonId is specified, filter by lesson
    if (req.params.lessonId) {
      filter = { lesson: req.params.lessonId };
    }

    // For students, only show published assignments
    if (req.user.role === 'student') {
      filter.isPublished = true;
    }

    const assignments = await Assignment.find(filter);

    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: {
        assignments
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get one assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'No assignment found with that ID'
      });
    }

    // For students, only show published assignments
    if (req.user.role === 'student' && !assignment.isPublished) {
      return res.status(403).json({
        status: 'fail',
        message: 'This assignment is not published yet'
      });
    }

    // Check if user is enrolled in the course or is the instructor/admin
    const course = await Course.findById(assignment.course._id);
    
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
        assignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    // If courseId is coming from the URL, use it
    if (req.params.courseId) {
      req.body.course = req.params.courseId;
    }

    // If lessonId is coming from the URL, use it
    if (req.params.lessonId) {
      req.body.lesson = req.params.lessonId;
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
        message: 'You are not authorized to add assignments to this course'
      });
    }

    const newAssignment = await Assignment.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        assignment: newAssignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'No assignment found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    const course = await Course.findById(assignment.course._id);
    
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this assignment'
      });
    }

    // Update the updatedAt field
    req.body.updatedAt = Date.now();

    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        assignment: updatedAssignment
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'No assignment found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    const course = await Course.findById(assignment.course._id);
    
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this assignment'
      });
    }

    // Delete the assignment
    await Assignment.findByIdAndDelete(req.params.id);

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

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'No assignment found with that ID'
      });
    }

    // Check if assignment is published
    if (!assignment.isPublished) {
      return res.status(403).json({
        status: 'fail',
        message: 'This assignment is not published yet'
      });
    }

    // Check if due date has passed
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({
        status: 'fail',
        message: 'The due date for this assignment has passed'
      });
    }

    // Check if user is enrolled in the course
    const course = await Course.findById(assignment.course._id);
    
    const isEnrolled = course.enrollments.some(
      enrollment => enrollment.user.toString() === req.user._id.toString()
    );
    
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not enrolled in this course'
      });
    }

    // Check if student has already submitted
    const hasSubmitted = assignment.submissions.some(
      submission => submission.student.toString() === req.user._id.toString()
    );

    if (hasSubmitted) {
      // Update existing submission
      await Assignment.findOneAndUpdate(
        { 
          _id: req.params.id,
          'submissions.student': req.user._id
        },
        {
          $set: {
            'submissions.$.content': req.body.content,
            'submissions.$.attachments': req.body.attachments,
            'submissions.$.submissionDate': Date.now(),
            'submissions.$.isGraded': false
          }
        }
      );
    } else {
      // Add new submission
      await Assignment.findByIdAndUpdate(req.params.id, {
        $push: {
          submissions: {
            student: req.user._id,
            content: req.body.content,
            attachments: req.body.attachments,
            submissionDate: Date.now()
          }
        }
      });
    }

    res.status(200).json({
      status: 'success',
      message: hasSubmitted ? 'Assignment resubmitted' : 'Assignment submitted'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Grade assignment
exports.gradeAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        status: 'fail',
        message: 'No assignment found with that ID'
      });
    }

    // Check if user is the instructor of the course or an admin
    const course = await Course.findById(assignment.course._id);
    
    if (course.instructor._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to grade this assignment'
      });
    }

    // Find the submission
    const submission = assignment.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No submission found with that ID'
      });
    }

    // Update the grade and feedback
    submission.grade = grade;
    submission.feedback = feedback;
    submission.isGraded = true;

    await assignment.save();

    res.status(200).json({
      status: 'success',
      message: 'Assignment graded successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};