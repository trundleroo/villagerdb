const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const favicon = require('serve-favicon');
const logger = require('morgan');
const hbs = require('express-handlebars');
const staticify = require('staticify')(path.join(process.cwd(), 'public'));

const indexRouter = require('./routes/index');
const villagersRouter = require('./routes/villagers');
const villagerRouter = require('./routes/villager');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
const handlebars = hbs.create({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        getVersionedPath: (path) => {
            return staticify.getVersionedPath(path);
        }
    }
});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

// Remove versioning from request paths.
app.use(staticify.middleware);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Do not panic if favicon.ico can't be found.
try {
    app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
} catch (e) {
    console.log('Warning: favicon middleware reported an error. Skipping.');
}

app.use(lessMiddleware(path.join(__dirname, 'public'),
    {once: app.get('env') === 'production'}));
app.use(express.static(path.join(__dirname, 'public')));

// Do not send X-Powered-By header.
app.disable('x-powered-by');

// Router setup.
app.use('/', indexRouter);
app.use('/villagers', villagersRouter);
app.use('/villager', villagerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
