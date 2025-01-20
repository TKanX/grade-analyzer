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

/**
 * @function updateGrade - Update a grade (semester/quarter) by ID.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateGrade = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const grade = {
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    courses: req.body.courses,
    gradingMode: req.body.gradingMode,
    gradeRange: req.body.gradeRange,
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

  // Update the grade
  try {
    // First check if grade exists and belongs to user
    const existingGrade = await gradeService.getGradeById(id);
    if (!existingGrade) {
      return res.notFound('Grade not found.', 'GRADE_NOT_FOUND');
    }

    // Check if user is not the same as the requested user
    if (existingGrade.userId.toString() !== userId) {
      return res.forbidden('Forbidden to update this grade.', 'ACCESS_DENIED');
    }

    // If permission check passes, proceed with update
    const updatedGrade = await gradeService.updateGradeById(id, grade);
    return res.success(updatedGrade, 'Grade updated successfully.');
  } catch (error) {
    console.error('Error updating grade: ', error);
    return res.internalServerError(
      'Error updating grade.',
      'UPDATE_GRADE_ERROR',
    );
  }
};

/**
 * @function updateGradeFields - Update specific fields of a grade (semester/quarter) by ID. (JSON Patch)
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const updateGradeFields = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const patch = req.body;

  const disallowedFields = [
    '/_id',
    '/__v',
    '/userId',
    '/createdAt',
    '/updatedAt',
  ];

  // Update the grade fields
  try {
    // First check if grade exists and belongs to user
    const existingGrade = await gradeService.getGradeById(id);
    if (!existingGrade) {
      return res.notFound('Grade not found.', 'GRADE_NOT_FOUND');
    }

    // Check if user is not the same as the requested user
    if (existingGrade.userId.toString() !== userId) {
      return res.forbidden('Forbidden to update this grade.', 'ACCESS_DENIED');
    }

    const updatedGrade = existingGrade.toJSON();

    // If permission check passes, proceed with update
    for (const operation of patch) {
      const { op, from, path, value } = operation;

      if (disallowedFields.includes(path)) {
        return res.forbidden(
          'Forbidden to update some fields.',
          'ACCESS_DENIED',
        );
      }

      const keys = path.slice(1).split('/'); // Convert '/key1/key2' to ['key1', 'key2']
      let target = updatedGrade;

      // Navigate to the target object or array
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) {
          if (op === 'add') {
            target[keys[i]] = isNaN(keys[i + 1]) ? {} : [];
          } else {
            return res.badRequest(`Invalid path: ${path}`, 'INVALID_PATH');
          }
        }
        target = target[keys[i]];
      }

      const lastKey = keys[keys.length - 1];

      // Perform the operation
      switch (op) {
        case 'add':
          if (Array.isArray(target)) {
            target.splice(parseInt(lastKey, 10), 0, value);
          } else {
            target[lastKey] = value;
          }
          break;

        case 'replace':
          target[lastKey] = value;
          break;

        case 'remove':
          if (Array.isArray(target)) {
            target.splice(parseInt(lastKey, 10), 1);
          } else {
            delete target[lastKey];
          }
          break;

        case 'copy':
          if (!from) {
            return res.badRequest(
              'Missing "from" in copy operation.',
              'INVALID_OPERATION',
            );
          }
          const fromKeys = from.slice(1).split('/');
          let fromTarget = updatedGrade;

          for (const key of fromKeys) {
            if (!(key in fromTarget)) {
              return res.badRequest(
                `Invalid from path: ${from}`,
                'INVALID_FROM_PATH',
              );
            }
            fromTarget = fromTarget[key];
          }

          target[lastKey] = JSON.parse(JSON.stringify(fromTarget));
          break;

        case 'move':
          if (!from) {
            return res.badRequest(
              'Missing "from" in move operation.',
              'INVALID_OPERATION',
            );
          }
          const fromKeysMove = from.slice(1).split('/');
          let fromTargetMove = updatedGrade;

          for (let i = 0; i < fromKeysMove.length - 1; i++) {
            if (!(fromKeysMove[i] in fromTargetMove)) {
              return res.badRequest(
                `Invalid from path: ${from}`,
                'INVALID_PATH',
              );
            }
            fromTargetMove = fromTargetMove[fromKeysMove[i]];
          }

          const fromLastKey = fromKeysMove[fromKeysMove.length - 1];
          const movedValue = fromTargetMove[fromLastKey];

          if (Array.isArray(fromTargetMove)) {
            fromTargetMove.splice(parseInt(fromLastKey, 10), 1);
          } else {
            delete fromTargetMove[fromLastKey];
          }

          if (Array.isArray(target)) {
            target.splice(parseInt(lastKey, 10), 0, movedValue);
          } else {
            target[lastKey] = movedValue;
          }
          break;

        case 'test':
          if (JSON.stringify(target[lastKey]) !== JSON.stringify(value)) {
            return res.badRequest(
              `Test operation failed at path: ${path}`,
              'TEST_FAILED',
            );
          }
          break;

        default:
          return res.badRequest(
            `Unsupported operation: ${op}`,
            'INVALID_OPERATION',
          );
      }
    }

    // Update the grade
    let result = await gradeService.updateGradeById(id, updatedGrade);
    result = {
      _id: result._id,
      userId: result.userId,
      name: result.name,
      startDate: result.startDate,
      endDate: result.endDate,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
    return res.success(result, 'Grade updated successfully.');
  } catch (error) {
    console.error('Error updating grade fields: ', error);
    return res.internalServerError(
      'Error updating grade fields.',
      'UPDATE_GRADE_FIELDS_ERROR',
    );
  }
};

module.exports = {
  createGrade,
  getGrades,
  getGrade,
  updateGrade,
  updateGradeFields,
};
