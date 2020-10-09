const express = require('express');
const bcrypt = require('bcrypt');
const logger = require('../logger');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const redis = require('redis');
const { User, Post, Tag } = require('../models');

const router = express.Router();
const { isLoggedIn, isNotLoggedIn, verifyToken, upload } = require('./middlewares');
const multerParser = multer();

router.post('/posts', verifyToken, multerParser.none(), upload.fields([{ name: 'mainImg'}, {name: 'posterImg'}, {name: 'previewImg'}]), async (req, res) => {
    const { title, description, preview, tags, email } = req.body;
    console.log(req);
    
    
    try {
        const post = await Post.create({
            author,
            title,
            description,
            preview,
            posterImg,
            previewImg,
            mainImg,
        });

        const user = User.findOne({
            where: { email },
        });

        if(!user) {
            return res.status(400).json({
                message: "invalid user email",
            })
        }
        
        const selectTags = tags.map((tagName) => {
            //TODO: set PK to name field
            let tag = Tag.findOne({
                where: { name: tagName },
            });
            if(!tag){
                tag = Tag.create({
                    name: tagName,
                });
            }
            return tag;
        });
        
        selectTags.forEach((tag) => {
            post.addTags(tag);
        });

        post.addUsers(user);
        
        return res.status(201).json({
            message: '게시글 작성이 완료되었습니다.',
        });

    } catch (error) {
        console.error(error);
        logger.error(error);
        return res.status(500).json({
            message: 'internal server error',
        });
    }
});


module.exports = router;