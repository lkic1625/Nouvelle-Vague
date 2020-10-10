var express = require('express');
var router = express.Router();
var { Post } = require('../models');

/* GET home page. */
router.get('/init', async (req, res) => {
  
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll();
    
    if(req.session.key) {
      res.render('index', { 
        email : req.session.key,
        posts: posts,
      });
    } else{ 
      res.render('index', {
        posts: posts,
    });
    }
  } catch (error) {
    console.error(error);
    res.render('index');
  }
  
});


module.exports = router;
