/**
 * @fileoverview Grade (Semester/Quarter) Service
 * @description Grade service for interacting with the database.
 */

const mongoose = require('mongoose');
const Grade = require('../models/gradeSchema');

/**
 * @function createGrade - Create a new grade (semester/quarter).
 * @param {Object} grade - The grade object to create.
 * @returns {Promise<Object>} - The created grade object.
 * @throws {Error} - Throws an error if the grade fails to create.
 */
const createGrade = async (grade) => {
  try {
    const newGrade = new Grade(grade);
    const savedGrade = await newGrade.save();
    return savedGrade;
  } catch (error) {
    console.error('Error in creating grade: ', error);
    throw error;
  }
};

/**
 * @function getGrades - Get all grades for a user. (not detailed)
 * @param {string} userId - The user ID to get grades for.
 * @returns {Promise<Array>} - An array of grade objects.
 * @throws {Error} - Throws an error if the grades fail to get.
 */
const getGrades = async (userId) => {
  try {
    const grades = await Grade.find({ userId }).select(
      'userId name startDate endDate createdAt updatedAt',
    );
    return grades;
  } catch (error) {
    console.error('Error in getting grades: ', error);
    throw error;
  }
};

/**
 * @function getDetailedGrades - Get all grades for a user.
 * @param {string} userId - The user ID to get grades for.
 * @returns {Promise<Array>} - An array of grade objects.
 * @throws {Error} - Throws an error if the grades fail to get.
 */
const getDetailedGrades = async (userId) => {
  try {
    const grades = await Grade.find({ userId });
    return grades;
  } catch (error) {
    console.error('Error in getting detailed grades: ', error);
    throw error;
  }
};

/**
 * @function getGradeById - Get a grade by ID.
 * @param {string} gradeId - The grade ID to get.
 * @returns {Promise<Object>} - The grade object.
 * @throws {Error} - Throws an error if the grade fails to get.
 */
const getGradeById = async (gradeId) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) return null;

  try {
    const grade = await Grade.findById(gradeId);
    return grade;
  } catch (error) {
    console.error('Error in getting grade by ID: ', error);
    throw error;
  }
};

/**
 * @function updateGradeById - Update a grade by ID.
 * @param {string} gradeId - The grade ID to update.
 * @param {Object} grade - The grade object to update.
 * @returns {Promise<Object>} - The updated grade object.
 * @throws {Error} - Throws an error if the grade fails to update.
 */
const updateGradeById = async (gradeId, grade) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) return null;

  try {
    const updatedGrade = await Grade.findByIdAndUpdate(gradeId, grade, {
      new: true,
    });
    if (!updatedGrade) {
      throw new Error('Grade not found.');
    }
    return updatedGrade;
  } catch (error) {
    console.error('Error in updating grade: ', error);
    throw error;
  }
};

/**
 * @function deleteGradeById - Delete a grade by ID.
 * @param {string} gradeId - The grade ID to delete.
 * @returns {Promise<Object>} - The deleted grade object.
 * @throws {Error} - Throws an error if the grade fails to delete.
 */
const deleteGradeById = async (gradeId) => {
  if (!mongoose.Types.ObjectId.isValid(gradeId)) return null;

  try {
    const deletedGrade = await Grade.findByIdAndDelete(gradeId);
    if (!deletedGrade) {
      throw new Error('Grade not found.');
    }
    return deletedGrade;
  } catch (error) {
    console.error('Error in deleting grade by ID: ', error);
    throw error;
  }
};

module.exports = {
  createGrade,
  getGrades,
  getDetailedGrades,
  getGradeById,
  updateGradeById,
  deleteGradeById,
};
