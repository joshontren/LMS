const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A lesson must have a title'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'A lesson must belong to a course']
  },
  content: {
    type: String,
    required: [true, 'A lesson must have content']
  },
  order: {
    type: Number,
    required: [true, 'A lesson must have an order']
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  videoUrl: String,
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Middleware to populate course on find
lessonSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'title instructor'
  });
  next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;