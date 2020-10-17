const express = require('express');
const bcrypt = require('bcrypt');
const logger = require('../logger');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const redis = require('redis');
const fs = require('fs');

const { QueryTypes, Sequelize } = require('sequelize');
const { User, Post, Tag, sequelize } = require('../models');

const router = express.Router();
const { isLoggedIn, isNotLoggedIn, verifyToken, upload } = require('./middlewares');
const multerParser = multer();

// router.use(async (req, res) => {


//     let postJSON = JSON.parse(fs.readFileSync('./public/review.json'));
//     try {
//         for await (let post of postJSON){
//             console.log(post);
//             const previewImg = post.previewImg;
//             const title = post.title;
//             const author = post.author;
//             const posterImg = post.postimgsrc;
//             const mainImg = post.postimgsrc;
//             const description = post.posttxt;
//             const tags = post.tags;
//             const preview = post.posttxt;


//             const sequelizePostResult = await Post.create({
//                 title,
//                 previewImg,
//                 preview,
//                 author,
//                 posterImg,
//                 mainImg,
//                 description,
//             });
//             for await (let tag of tags){
//                 const sequelzieTagResult = await Tag.findOrCreate({
//                     where:{
//                         tag,
//                     }
//                 });
//                 await sequelizePostResult.addTags(sequelzieTagResult[0]);
//             }
//         }

//     } catch (error) {
//         console.error(error);
//     }




// });

router.post('/posts/like/:post_id', verifyToken, async (req, res) => {
    const post_id = req.params.post_id;
    const user_id = req.decoded.id;
    try {
        const post = await Post.findOne({
            where: { id: post_id },
        });
        if (!post) {
            return res.status(204).json({
                message: 'invalid post id',
            })
        }
        const user = await User.findOne({
            where: { id: user_id },
        });
        if (!user) {
            return res.status(204).json({
                message: 'invalid user id',
            })
        }

        const like = await sequelize.query(
            "SELECT * FROM `likes` WHERE UserId=:user_id AND PostId=:post_id LIMIT 1",
            {
                replacements: { user_id: user_id, post_id: post_id },
                type: QueryTypes.SELECT,
            }
        )
        if (like.length == 0) {
            await post.addUsers(user);
            return res.status(201).json({
                code: 201,
                message: 'like',
            });
        }
        await sequelize.query(
            "DELETE FROM `likes` WHERE `UserId`=:user_id AND `PostId`=:post_id LIMIT 1",
            {
                replacements: { user_id: user_id, post_id: post_id, },
                type: QueryTypes.DELETE,
            }
        )
        return res.status(201).json({
            status: 201,
            message: 'dislike',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: '서버 오류',
        });
    }
});

router.get('/posts/:post_id', async (req, res) => {
    const post_id = req.params.post_id;
    const email = req.session.key;
    try {
        
        const post = await Post.findOne({
            where: { id: post_id },
            include: [{
                model: User,
                attributes: ['id', 'name'],
            }, {
                model: Tag,
                attributes: ['id', 'tag'],
            }]
        });
        
        let isLike = false;
        if(email){
            like = await sequelize.query(
                "SELECT l.id FROM users l JOIN likes r ON r.UserId = l.id WHERE l.email =:email AND r.PostId =:post_id",
                {
                    replacements: { email: email, post_id: post_id },
                    type: QueryTypes.SELECT,
                }
            );
            isLike = like.length != 0;
        }
        post.views += 1;
        await post.save();

        res.status(200).json({
            message: 'success',
            post: JSON.stringify(post),
            like: isLike,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: '서버 오류',
        })
    }
});

router.post('/posts', verifyToken, upload.fields([{ name: 'mainImg' }, { name: 'posterImg' }, { name: 'previewImg' }]), async (req, res) => {
    const { title, description, tags } = req.body;
    const { mainImg, posterImg, previewImg } = req.files;
    console.log(req);

    try {
        const user = await User.findOne({
            where: { id: req.decoded.id },
        });

        if (!user) {
            return res.status(400).json({
                message: "invalid user email",
            })
        }
        if (!mainImg || !previewImg || !posterImg) {
            throw new Error('img link must not be null');
        }
        const post = await Post.create({
            author: user.name,
            title,
            description,
            preview: description,
            posterImg: posterImg[0].location,
            previewImg: previewImg[0].location,
            mainImg: mainImg[0].location,
            UserId: user.id,
        });

        for await (let hashtag of JSON.parse(tags)) {

            let tag = await Tag.findOrCreate({
                where: { tag: hashtag.replace('#', '') },
            });
            console.log(tag);
            await post.addTags(tag[0]);
        }

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