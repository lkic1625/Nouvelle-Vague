const express = require('express');
const router = express.Router();
const { Post, User, Tag, sequelize } = require('../models');

const { QueryTypes, Sequelize } = require('sequelize');
/* GET home page. */
router.get('/init', async (req, res) => {
  
});

router.get('/', async (req, res) => {
  try {
   
    const posts = await Post.findAll({
      include: {
        model: Tag,
      }
    });
    const tags = await Tag.findAll({
      order:  Sequelize.literal('rand()'),
      limit: 4,
    })
    if(req.session.key) {
      const email = req.session.key;
      const user = await User.findOne({
        where: { email, }
      });
      const likes = await sequelize.query(
        "SELECT r.title, r.id FROM likes l JOIN posts r ON r.id = l.PostId WHERE l.UserId = :user_id", 
        {
          replacements: { user_id: user.id },
          type: QueryTypes.SELECT,
        }
      )
      
      res.render('index', { 
        email, 
        posts: posts,
        likes: likes,
        tags: tags,
      });
    } else{ 
      res.render('index', {
        posts: posts,
        tags: tags,
    });
    }
  } catch (error) {
    console.error(error);
    res.render('index');
  }
  
});


module.exports = router;
