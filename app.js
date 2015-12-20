var express = require('express');
var readdirp = require('readdirp');

var app = express();
app.set('views', __dirname + '/public/app')
app.set('view engine', 'jade')

/*
Set bower and app directories for static retrieval.
JS files from app will use this path, not jade files becaue those need to be rendered
*/
app.use('/static/common', express.static(__dirname + '/public/common'));
app.use('/static/framework', express.static(__dirname + '/public/app/framework'));

/*
Scan through the app directory to dynamically add js files to html file
*/
var frameworkFiles = [];
var dashboardFiles = [];

//Framework js files
readdirp({ root: __dirname + '/public/app/framework/', fileFilter: '*.jade' })
  .on('data', function (entry) {
    frameworkFiles.push('/app-render/framework/' + entry.path);
  });
//Dashboard ui element js files
readdirp({ root: __dirname + '/public/app/dashboard-elements/', fileFilter: '*.jade' })
  .on('data', function (entry) {
    dashboardFiles.push('/app-render/dashboard-elements/' + entry.path);
  });

/*
Some routing...may put this in another file later
*/
app.get(['/','/crouton','/crouton/*'], function (req, res) {
  var returnObj = {};
  returnObj.title = "Crouton";
  returnObj.css = [
    '/static/common/bower/font-awesome/css/font-awesome.min.css',
    '/static/common/css/toast.css',
    '/static/common/css/style.css',
    '/static/common/css/tmpl.css'
  ];
  returnObj.jsExternal = [
    '/static/common/js/browserMqtt.js',
    '/static/common/bower/webcomponentsjs/webcomponents-lite.js',
    '/static/common/bower/packery/dist/packery.pkgd.min.js',
    '/static/common/bower/draggabilly/dist/draggabilly.pkgd.min.js',
    '/static/common/bower/jquery/dist/jquery.min.js'
  ];
  returnObj.frameworkFiles = frameworkFiles;
  returnObj.dashboardFiles = dashboardFiles;
  res.render('index',returnObj);
});
//intercept templating for css files in framework
app.get('/app-render/framework/**/*.css', function (req, res) {
  res.sendFile(__dirname + "/public/app/framework/"+req.params[0]+"/"+req.params[2]+".css");
});
app.get('/app-render/dashboard-elements/**/*.css', function (req, res) {
  res.sendFile(__dirname + "/public/app/dashboard-elements/"+req.params[0]+"/"+req.params[2]+".css");
});
//templating angular html (jade) files
app.get('/app-render/framework/**/*.jade', function (req, res) {
  res.render("framework/"+req.params[0]+"/"+req.params[2]+".jade");
});
app.get('/app-render/dashboard-elements/**/*.jade', function (req, res) {
  res.render("dashboard-elements/"+req.params[0]+"/"+req.params[2]+".jade");
});
//404
app.use(function(req, res, next) {
  res.redirect('/crouton/404');
});

/*
Start the app
*/
var port = process.env.PORT || 8080;
var server = app.listen(port, function () {
  var host = process.env.VCAP_APP_HOST || 'localhost';
  console.log('Crouton started at http://%s:%s', host, port);
});