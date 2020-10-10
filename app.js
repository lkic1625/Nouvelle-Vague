const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const helmet = require('helmet');
const hpp = require('hpp')
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const fs = require('fs');
const flash = require('connect-flash');

const logger = require('./logger');
const { sequelize } = require('./models');
const indexRouter = require('./routes');
const userRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const boardRouter =require('./routes/board');
// const passportConfig = require('./passport');

const app = express();

dotenv.config();
// passportConfig();
app.set('port', process.env.PORT || 8002);
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});
sequelize.sync({ force: false })
  .then(() => {
    console.log("connect DB success");
  })
  .catch((err) => {
    console.error(err);
  });

//production env setting
if (process.env.NODE_ENV === 'production'){
  //log middleware
  app.use(morgan('combined'));
  //Helmet helps you secure your Express.js apps by setting various HTTP headers. 
  app.use(helmet());
  // Express middleware to protect against HTTP Parameter Pollution attacks.
  app.use(hpp());
} else{
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//:true then express use qs module
//:false then express use query-string module
//The differences between parsing with `qs library` vs `querystring library`
//https://stackoverflow.com/questions/29960764/what-does-extended-mean-in-express-4-0/45690436#45690436
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));


const client = redis.createClient({
  no_ready_check: true,
  port: process.env.REDIS_PORT,
  logErrors: true,
});

const sessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 30*60*1000,
  },
  store: new RedisStore({
    client
  }),
}

app.use(session(sessionOptions))

if (process.env.NODE_ENV === 'production'){
  sessionOptions.proxy = true;
  sessionOptions.cookie.secure = true;
}

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/board', boardRouter);

app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.error(error.message);
  next(error);
});

//error middleware
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.info(app.get('port'), '번 포트에서 대기중');
});