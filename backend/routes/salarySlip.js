const express = require('express');
const jwt = require('jsonwebtoken');
const SalarySlip = require('../models/SalarySlip');

const router = express.Router();

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST /salary-slip (Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  try {
    const salarySlip = new SalarySlip(req.body);
    await salarySlip.save();
    res.status(201).json(salarySlip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /salary-slip/:id (Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  try {
    const salarySlip = await SalarySlip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salarySlip) return res.status(404).json({ message: 'Salary slip not found' });
    res.json(salarySlip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /salary-slip (Employee: own)
router.get('/', auth, async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find({ employeeId: req.user.id });
    res.json(salarySlips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
