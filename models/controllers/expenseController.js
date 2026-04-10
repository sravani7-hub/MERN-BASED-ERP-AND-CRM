const Expense = require('../models/Expense');

// @desc    Get all expenses (paginated, filterable)
// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate('paidBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort('-date'),
      Expense.countDocuments(filter),
    ]);

    // Calculate totals
    const totalAmount = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      totalAmount: totalAmount[0]?.total || 0,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('paidBy', 'name email');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Create expense
// @route   POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExpenses, getExpense, createExpense, updateExpense, deleteExpense };
