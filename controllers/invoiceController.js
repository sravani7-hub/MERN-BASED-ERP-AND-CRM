const Invoice = require('../models/Invoice');

// @desc    Get all invoices (with pagination, filter)
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      if (req.query.status.includes(',')) {
        filter.status = { $in: req.query.status.split(',') };
      } else {
        filter.status = req.query.status;
      }
    }
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.search) {
      filter.invoiceNumber = { $regex: req.query.search, $options: 'i' };
    }
    // Overdue filter
    if (req.query.overdue === 'true') {
      filter.status = { $in: ['unpaid', 'partial'] };
      filter.dueDate = { $lt: new Date() };
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('customer', 'name email company')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt'),
      Invoice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      'customer',
      'name email company phone address'
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res, next) => {
  try {
    // Auto-generate invoice number if not provided
    if (!req.body.invoiceNumber) {
      req.body.invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Auto-calculate item totals and grand total
    if (req.body.items && Array.isArray(req.body.items)) {
      req.body.items = req.body.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      req.body.totalAmount = req.body.items.reduce((sum, item) => sum + item.total, 0);
    }

    const invoice = await Invoice.create(req.body);
    const populated = await invoice.populate('customer', 'name email company');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = async (req, res, next) => {
  try {
    // Recalculate totals if items are updated
    if (req.body.items && Array.isArray(req.body.items)) {
      req.body.items = req.body.items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      }));
      req.body.totalAmount = req.body.items.reduce((sum, item) => sum + item.total, 0);
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('customer', 'name email company');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice };
