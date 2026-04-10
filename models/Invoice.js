const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    items: {
      type: [InvoiceItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one item is required',
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['paid', 'unpaid', 'partial', 'overdue', 'cancelled'],
        message: 'Status must be paid, unpaid, partial, overdue, or cancelled',
      },
      default: 'unpaid',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate invoice number before save
InvoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Auto-compute status from paidAmount
InvoiceSchema.methods.updatePaymentStatus = function () {
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'unpaid';
  }
};

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);
