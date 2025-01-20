/**
 * @fileoverview Grade Controllers
 * @description Controllers for interacting with grades.
 */

const gradeService = require('../services/gradeService');

const validationUtils = require('../utils/validationUtils');

const DEFAULT_GRADE_END_DATE_MONTHS = 3;

/**
 * @function createGrade - Create a new grade (semester/quarter).
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const createGrade = async (req, res) => {
  const { userId } = req.user;
  const grade = {
    userId,
    name: req.body.name,
    startDate: req.body.startDate || new Date(),
    endDate:
      req.body.endDate ||
      new Date().setMonth(
        new Date().getMonth() + DEFAULT_GRADE_END_DATE_MONTHS,
      ),
  };

  // Check if the grade name is valid
  if (!validationUtils.validateGradeName(grade.name)) {
    return res.badRequest('Invalid grade name.', 'INVALID_GRADE_NAME');
  }

  // Check if the grade start date is valid
  if (!validationUtils.validateStartDate(grade.startDate)) {
    return res.badRequest('Invalid start date.', 'INVALID_START_DATE');
  }

  // Check if the grade end date is valid
  if (!validationUtils.validateEndDate(grade.endDate)) {
    return res.badRequest('Invalid end date.', 'INVALID_END_DATE');
  }

  // Create the grade
  try {
    const newGrade = await gradeService.createGrade(grade);
    return res.success(newGrade, 'Grade created successfully.');
  } catch (error) {
    console.error('Error creating grade: ', error);
    return res.internalServerError(
      'Error creating grade.',
      'CREATE_GRADE_ERROR',
    );
  }
};

/**
 * @function getGrades - Get all grades (semesters/quarters) for a user.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getGrades = async (req, res) => {
  const { userId } = req.user;
  const detailed = req.query?.detailed === 'true';

  try {
    if (detailed) {
      // If detailed is true, get detailed grades
      const grades = await gradeService.getDetailedGrades(userId);
      return res.success(grades, 'Grades retrieved successfully.');
    } else {
      // If detailed is false, get non-detailed grades
      const grades = await gradeService.getGrades(userId);
      return res.success(grades, 'Grades retrieved successfully.');
    }
  } catch (error) {
    console.error('Error getting grades: ', error);
    return res.internalServerError('Error getting grades.', 'GET_GRADES_ERROR');
  }
};

/**
 * @function getGrade - Get a grade (semester/quarter) by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const getGrade = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const grade = await gradeService.getGradeById(id);
    if (!grade) {
      return res.notFound('Grade not found.', 'GRADE_NOT_FOUND');
    }

    // Check if user is not the same as the requested user
    if (grade.userId.toString() !== userId) {
      return res.forbidden(
        'Forbidden to get grade for this user.',
        'ACCESS_DENIED',
      );
    }

    return res.success(grade, 'Grade retrieved successfully.');
  } catch (error) {
    console.error('Error getting grade: ', error);
    return res.internalServerError('Error getting grade.', 'GET_GRADE_ERROR');
  }
};

module.exports = {
  createGrade,
  getGrades,
  getGrade,
};
