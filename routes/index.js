var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  
  if(req.session.key) {
    res.render('index', { email : req.session.key });
  } else{ 
    res.render('index', { title: 'Nouvelle Vague' });
  }
});


module.exports = router;
