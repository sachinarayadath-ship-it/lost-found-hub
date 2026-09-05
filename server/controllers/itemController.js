const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    List items with filters & pagination
// @route   GET /api/items
// @access  Public
const getItems = async (req, res, next) => {
  try {
    const { q, kind, type, category, location, status, from, to, page = 1, limit = 12 } = req.query;

    const query = {};

    // Filter by kind or type
    const itemKind = kind || type;
    if (itemKind) {
      query.kind = itemKind;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.location = location;
    }

    // Filter by status (default to non-rejected for public listing if status not specified)
    if (status) {
      query.status = status;
    } else {
      query.status = { $nin: ['rejected'] };
    }

    // Date range filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    // Search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.json({
      data: items,
      page: pageNum,
      totalPages,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { title, kind, type, category, description, location, date, imageUrl: bodyImageUrl } = req.body;

    let imageUrl = bodyImageUrl || '';

    if (req.file) {
      // Form local server URL for image
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const item = await Item.create({
      title,
      kind: kind || type || 'lost',
      category,
      description,
      location,
      date: date || new Date().toISOString(),
      imageUrl,
      status: req.user && req.user.role === 'admin' ? 'open' : 'pending',
      reportedBy: req.user._id,
    });

    const populatedItem = await Item.findById(item._id).populate('reportedBy', 'name email');

    return res.status(201).json(populatedItem);
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Owner/Admin)
const updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership or admin status
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    const fieldsToUpdate = ['title', 'kind', 'category', 'description', 'location', 'date', 'status', 'imageUrl'];
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      item.imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();
    const populated = await Item.findById(updatedItem._id).populate('reportedBy', 'name email');

    return res.json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private (Owner/Admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await Item.deleteOne({ _id: item._id });
    await Claim.deleteMany({ item: item._id });

    return res.json({ success: true, ok: true, message: 'Item removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's reported items
// @route   GET /api/items/mine, GET /api/items/my-reports
// @access  Private
const getMyReports = async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.json(items);
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary statistics
// @route   GET /api/items/stats
// @access  Public
const getItemStats = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments();
    const lostItems = await Item.countDocuments({ kind: 'lost' });
    const foundItems = await Item.countDocuments({ kind: 'found' });
    const resolvedItems = await Item.countDocuments({ status: { $in: ['resolved', 'claimed'] } });
    const activeClaims = await Claim.countDocuments({ status: 'pending' });

    const resolutionRate = totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0;

    return res.json({
      totalItems,
      lostItems,
      foundItems,
      resolvedItems,
      activeClaims,
      resolutionRate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyReports,
  getItemStats,
};
