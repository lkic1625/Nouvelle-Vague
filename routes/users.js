var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup', (req, res) => {
  res.render('signup', {
    title: '회원가입 - Nouvellle Vague',
    user: null,
    // signUpError: req.flash('')
  });
});

module.exports = router;
