const express = require('express');
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');

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

// POST /expense (Employee only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'employee') return res.status(403).json({ message: 'Access denied' });

  try {
    const expense = new Expense({ ...req.body, employeeId: req.user.id });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /expense (Employee: own)
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user.id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
