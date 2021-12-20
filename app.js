const express = require('express');
const createError = require('http-errors');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const indexRouter = require('./src/routes/index.router');
const lkRouter = require('./src/routes/lk.router');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;

const sessionConfig = {
  store: new FileStore(),
  key: 'rmsid',
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  httpOnly: true,
  cookie: { expires: 24 * 60 * 60e3 },
};

app.set('view engine', 'hbs');
app.set('views', path.join(process.env.PWD, 'src', 'views'));

hbs.registerPartials(path.join(process.env.PWD, 'src', 'views', 'partials'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.env.PWD, 'public')));
app.use(session(sessionConfig));

app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.name = req.session.first_name;
    res.locals.userEmail = req.session.userEmail;
    res.locals.userId = req.session.userId;
    res.locals.isadmin = req.session.isadmin;
  }
  next();
});

app.use('/', indexRouter);
app.use('/lk', lkRouter);

app.use((req, res, next) => {
  const error = createError(404, 'Запрашиваемой страницы не существует на сервере.');
  next(error);
});

app.use((err, req, res, next) => {
  const appMode = req.app.get('env');
  let error;

  if (appMode === 'development') {
    error = err;
  } else {
    error = {};
  }

  res.locals.message = err.message;
  res.locals.error = error;
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => console.log(`Server is working on ${PORT}`));
