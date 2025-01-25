/**
 * @fileoverview Grade Routes
 * @description Routes for interacting with grades.
 */

const express = require('express');
const router = express.Router();

const rateLimiter = require('../utils/rateLimiter');

const gradeControllers = require('../controllers/gradeControllers');

router.use(rateLimiter());

router.post('/', gradeControllers.createGrade);

router.get('/:id/export', gradeControllers.exportGrade);
router.get('/export', gradeControllers.exportGrades);
router.post('/import', gradeControllers.importGrades);

router.get('/', gradeControllers.getGrades);
router.get('/:id', gradeControllers.getGrade);

router.put('/:id', gradeControllers.updateGrade);
router.patch('/:id', gradeControllers.updateGradeFields); // JSON Patch

router.delete('/:id', gradeControllers.deleteGrade);

module.exports = router;
