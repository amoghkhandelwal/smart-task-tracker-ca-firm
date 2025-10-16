const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware');

// ✅ Enhanced mock AI suggestion logic
const mockAISuggestions = (title) => {
  const lowerTitle = title.toLowerCase().trim();
  let category = 'Other';
  let priority = 'Medium';

  if (/doctor|hospital|dentist|clinic|checkup|appointment/.test(lowerTitle)) {
    category = 'Health';
    priority = 'High';
  } else if (/gym|workout|exercise|yoga|fitness/.test(lowerTitle)) {
    category = 'Health';
    priority = 'Medium';
  } else if (/project|assignment|study|homework|exam|presentation/.test(lowerTitle)) {
    category = 'Study';
    priority = 'High';
  } else if (/buy|shopping|grocery|vegetables|fruits/.test(lowerTitle)) {
    category = 'Personal';
    priority = 'Low';
  } else if (/meeting|office|email|submit|review|call/.test(lowerTitle)) {
    category = 'Work';
    priority = 'High';
  }

  const suggestedTitle = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    suggestedTitle,
    suggestedPriority: priority,
    suggestedCategory: category
  };
};

// ✅ POST /api/tasks/ai-suggest
router.post(
  '/ai-suggest',
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;
    const result = mockAISuggestions(title);
    res.json(result);
  }
);

module.exports = router;
