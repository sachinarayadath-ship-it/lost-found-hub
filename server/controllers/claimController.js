const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

// @desc    Submit a claim on an item
// @route   POST /api/items/:itemId/claims, POST /api/claims
// @access  Private
const createClaim = async (req, res, next) => {
  try {
    const itemId = req.params.itemId || req.body.itemId || req.body.item;
    const { message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot submit a claim on your own reported item' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ item: itemId, claimedBy: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: 'You have already submitted a claim for this item' });
    }

    const claim = await Claim.create({
      item: itemId,
      claimedBy: req.user._id,
      message,
      status: 'pending',
    });

    // Increment item claim count
    item.claimCount = (item.claimCount || 0) + 1;
    await item.save();

    // Create a message in the discussion thread with the claim verification message
    await Message.create({
      item: itemId,
      sender: req.user._id,
      author: req.user.name,
      body: `[Claim Verification]: ${message}`,
    });

    // Create notification for item reporter
    await Notification.create({
      user: item.reportedBy,
      title: 'New Claim Received',
      body: `Someone has submitted a claim for your item "${item.title}".`,
      type: 'claim',
      relatedItem: item._id,
    });

    const populatedClaim = await Claim.findById(claim._id).populate({
      path: 'item',
      select: '_id title kind category location status imageUrl',
    });

    return res.status(201).json(populatedClaim);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's submitted claims
// @route   GET /api/claims/mine, GET /api/claims/my-claims
// @access  Private
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimedBy: req.user._id })
      .populate({
        path: 'item',
        select: '_id title kind category location status imageUrl',
      })
      .sort({ createdAt: -1 });

    return res.json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve claim
// @route   PUT /api/claims/:id/approve
// @access  Private (Admin or Item Owner)
const approveClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = 'approved';
    await claim.save();

    // Update item status to resolved
    if (claim.item) {
      const item = await Item.findById(claim.item._id);
      if (item) {
        item.status = 'resolved';
        await item.save();
      }
    }

    // Notify claimant
    await Notification.create({
      user: claim.claimedBy,
      title: 'Claim Approved!',
      body: `Your claim for item "${claim.item?.title || 'item'}" has been approved!`,
      type: 'status',
      relatedItem: claim.item?._id,
    });

    return res.json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject claim
// @route   PUT /api/claims/:id/reject
// @access  Private (Admin or Item Owner)
const rejectClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    claim.status = 'rejected';
    await claim.save();

    // Notify claimant
    await Notification.create({
      user: claim.claimedBy,
      title: 'Claim Update',
      body: `Your claim for item "${claim.item?.title || 'item'}" was rejected.`,
      type: 'status',
      relatedItem: claim.item?._id,
    });

    return res.json({ success: true, claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims for a specific item (only for the item owner or admin)
// @route   GET /api/items/:itemId/claims
// @access  Private
const getItemClaims = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Only allow the reporter of the item or an admin to see the claims
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view claims for this item' });
    }

    const claims = await Claim.find({ item: itemId })
      .populate({
        path: 'claimedBy',
        select: '_id name email phone',
      })
      .sort({ createdAt: -1 });

    return res.json(claims);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  approveClaim,
  rejectClaim,
  getItemClaims,
};
