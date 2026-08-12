const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyReports,
  getItemStats,
} = require('../controllers/itemController');
const { createClaim, getItemClaims } = require('../controllers/claimController');
const { getItemMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, itemValidator, claimValidator } = require('../utils/validators');

// Public stats & list
router.get('/stats', getItemStats);
router.get('/', getItems);

// Protected user reports
router.get('/mine', protect, getMyReports);
router.get('/my-reports', protect, getMyReports);

// Get single item
router.get('/:id', getItemById);

// Create item
router.post('/', protect, upload.single('image'), validate(itemValidator), createItem);

// Update/delete item
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

// Claims on item
router.post('/:itemId/claims', protect, validate(claimValidator), createClaim);
router.get('/:itemId/claims', protect, getItemClaims);

// Item messaging thread
router.get('/:itemId/messages', protect, getItemMessages);
router.post('/:itemId/messages', protect, sendMessage);

module.exports = router;
