const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An assignment must have a title'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'An assignment must belong to a course']
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  description: {
    type: String,
    required: [true, 'An assignment must have a description']
  },
  dueDate: {
    type: Date
  },
  totalPoints: {
    type: Number,
    default: 100
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    content: String,
    attachments: [{
      name: String,
      fileUrl: String,
      fileType: String
    }],
    grade: Number,
    feedback: String,
    isGraded: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Middleware to populate course on find
assignmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'title instructor'
  });
  
  this.populate({
    path: 'lesson',
    select: 'title'
  });
  
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;