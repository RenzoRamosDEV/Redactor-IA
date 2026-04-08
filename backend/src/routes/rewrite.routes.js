const { Router } = require('express');
const { rewrite } = require('../controllers/rewrite.controller');
const { rateLimiter, getLimitStatus } = require('../middlewares/rateLimiter');

const router = Router();

router.get('/limits', getLimitStatus);
router.post('/rewrite', rateLimiter, rewrite);

module.exports = router;
