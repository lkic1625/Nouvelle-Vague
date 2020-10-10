const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const logger = require('../logger');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const redis = require('redis');

const { isLoggedIn, isNotLoggedIn, verifyToken } = require('./middlewares');
const multerParser = multer();
const redisClient = redis.createClient({ 
    no_ready_check: true,
    port: process.env.REDIS_PORT,
    logErrors: true,
});
// print redis errors to the console and logger
redisClient.on('error', (err) => {
    console.log('Error', + err);
    logger.log('Error', err);
});

  
const router = express.Router();
router.post('/signup', multerParser.none(), async (req, res, next) => {
    const { email, password, name } = req.body;
    try {
        const user = await User.findOne({
            where: { email, }
        });
        if(user){
            return res.status(202).json({
                message: '해당 이메일이 존재합니다.',
            });
            
        } 

        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            name,
            pw: hash,
        });
        return res.status(201).json({
            message: '회원가입이 완료됐습니다.',
        });
        
    } catch (error) {
        logger.error(error);
        console.error(error);
        return next(error);
    }
});

router.post('/logout', multerParser.none(), async (req, res, next) => {

    const { email } = req.body;
    console.log(req);
    try {
        req.session.destroy();
        const user = await User.findOne({ 
            where: { email, }
        });
        if(user){//case: find user
            
            return res.clearCookie("jwt").status(200).json({
                message: '로그아웃 성공',
            });  

        } else{//case: cannot find user 
            return res.status(202).json({
                message: '일치하는 사용자가 없습니다.'
            });
        }
    } catch (error) {
        logger.error(error);
        console.error(error);
        return next(error);
    }
});

router.post('/login', multerParser.none(), async (req, res, next) => {

    const { email, password } = req.body;
    console.log(email, password);
    try {
        const user = await User.findOne({ 
            where: { email, }
        });
        if(user){//case: find user
            const isValid = await bcrypt.compare(password, user.pw);
            if( isValid ){
                const token = jwt.sign({
                    id: user.id,
                    name: user.name,
                  }, process.env.JWT_SECRET, {
                    expiresIn: '30m', // 30분
                    issuer: 'NV server',
                });
                user.pw = "";
                req.session.key = email;
                
                return res.status(200)
                .json({
                    email: user.email,
                    token: token
                });
                            
            }
        } else{//case: cannot find user 
            return res.status(202).json({
                message: '일치하는 사용자가 없습니다.'
            });
        }
    } catch (error) {
        logger.error(error);
        console.error(error);
        return next(error);
    }
});

module.exports = router;