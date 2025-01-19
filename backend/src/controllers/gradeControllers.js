/**
 * @fileoverview Grade Controllers
 * @description Controllers for interacting with grades.
 */

const gradeService = require('../services/gradeService');

/**
 * @function getGrades - Get all grades for a user.
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

module.exports = {
  getGrades,
};
