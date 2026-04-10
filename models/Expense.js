const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: ['office_supplies', 'travel', 'software', 'marketing', 'utilities', 'rent', 'salary', 'maintenance', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    receipt: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ status: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
