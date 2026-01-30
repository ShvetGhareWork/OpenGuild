const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'Governance routes coming soon' } });
});

module.exports = router;
