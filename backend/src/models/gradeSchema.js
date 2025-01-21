/**
 * @fileoverview Grade Schema
 * @description Grade schema for the MongoDB database.
 */

const mongoose = require('mongoose');

// Define the task schema
const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: null,
    },
    total: {
      type: Number,
      required: true,
      default: null,
    },
    extraCredit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    _id: false,
  },
);

// Define the category schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    tasks: {
      type: [taskSchema],
      required: false,
    },
    percentage: {
      type: Number,
      required: false,
      default: null,
    },
    goal: {
      type: Number,
      required: false,
    },
  },
  {
    _id: false,
  },
);

// Define the course schema
const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['standard', 'honors', 'advanced'],
      required: false,
      default: 'standard',
    },
    categories: {
      type: [categorySchema],
      required: false,
    },
    percentage: {
      type: Number,
      required: false,
      default: null,
    },
    goal: {
      type: Number,
      required: false,
    },
  },
  {
    _id: false,
  },
);

// Define the grade (semester/quarter) schema
const gradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    courses: {
      type: [courseSchema],
      required: false,
    },
    gradingMode: {
      type: String,
      enum: ['continuous', 'discrete'], // continuous: percentage -> GPAs AND percentage -> letter, discrete: percentage -> letter -> GPAs
      required: false,
      default: 'discrete',
    },
    goals: {
      gpa: {
        type: Number,
        required: false,
      },
      weightedGPA: {
        type: Number,
        required: false,
      },
    },
    gradeRange: {
      type: [
        {
          percentage: {
            type: Number,
            required: true,
          }, // xx% or higher
          letter: {
            type: String,
            required: true,
          },
          GPA: {
            type: Number,
            required: true,
          },
          honorsGPA: {
            type: Number,
            required: true,
          },
          advancedGPA: {
            type: Number,
            required: true,
          },
          _id: false,
        },
      ],
      required: false,
      default: [
        {
          percentage: 97,
          letter: 'A+',
          GPA: 4.0,
          honorsGPA: 4.5,
          advancedGPA: 5.0,
        },
        {
          percentage: 93,
          letter: 'A',
          GPA: 4.0,
          honorsGPA: 4.5,
          advancedGPA: 5.0,
        },
        {
          percentage: 90,
          letter: 'A-',
          GPA: 4.0,
          honorsGPA: 4.5,
          advancedGPA: 5.0,
        },
        {
          percentage: 87,
          letter: 'B+',
          GPA: 3.0,
          honorsGPA: 3.5,
          advancedGPA: 4.0,
        },
        {
          percentage: 83,
          letter: 'B',
          GPA: 3.0,
          honorsGPA: 3.5,
          advancedGPA: 4.0,
        },
        {
          percentage: 80,
          letter: 'B-',
          GPA: 3.0,
          honorsGPA: 3.5,
          advancedGPA: 4.0,
        },
        {
          percentage: 77,
          letter: 'C+',
          GPA: 2.0,
          honorsGPA: 2.5,
          advancedGPA: 3.0,
        },
        {
          percentage: 73,
          letter: 'C',
          GPA: 2.0,
          honorsGPA: 2.5,
          advancedGPA: 3.0,
        },
        {
          percentage: 70,
          letter: 'C-',
          GPA: 2.0,
          honorsGPA: 2.5,
          advancedGPA: 3.0,
        },
        {
          percentage: 67,
          letter: 'D+',
          GPA: 1.0,
          honorsGPA: 1.5,
          advancedGPA: 2.0,
        },
        {
          percentage: 63,
          letter: 'D',
          GPA: 1.0,
          honorsGPA: 1.5,
          advancedGPA: 2.0,
        },
        {
          percentage: 60,
          letter: 'D-',
          GPA: 1.0,
          honorsGPA: 1.5,
          advancedGPA: 2.0,
        },
        {
          percentage: 0,
          letter: 'F',
          GPA: 0.0,
          honorsGPA: 0.0,
          advancedGPA: 0.0,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Index the userId field
gradeSchema.index({ userId: 1 });

// Index the startDate field
gradeSchema.index({ startDate: -1 });

// Index the endDate field
gradeSchema.index({ endDate: -1 });

// Create the grade model
const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
