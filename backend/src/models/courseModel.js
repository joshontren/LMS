const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
    trim: true,
    maxlength: [100, 'A course title must have less than or equal to 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'A course must have a description']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A course must have an instructor']
  },
  category: {
    type: String,
    required: [true, 'A course must have a category'],
    enum: ['programming', 'design', 'business', 'marketing', 'science', 'language', 'other']
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  enrollments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  coverImage: String,
  duration: Number, // in hours
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  price: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must be at most 5']
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'course',
  localField: '_id'
});

// Middleware to handle slugs
courseSchema.pre('save', function(next) {
  this.slug = this.title.toLowerCase().split(' ').join('-');
  next();
});

// Populate instructor on find
courseSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'instructor',
    select: 'name email profilePicture'
  });
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;