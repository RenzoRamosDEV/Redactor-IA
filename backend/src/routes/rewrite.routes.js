const { Router } = require('express');
const { rewrite } = require('../controllers/rewrite.controller');
const { rateLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.post('/rewrite', rateLimiter, rewrite);

module.exports = router;
