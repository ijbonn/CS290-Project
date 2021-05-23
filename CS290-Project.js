var express = require('express');
var session = require('express-session');
var request = require('request');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var session = require('express-session');
var credentials = require('./credentials.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({secret:'SuperSecretPassword'}));
app.use(express.static('public'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 4494);


// Start home page or ask for new session if none is active        
app.get('/',function(req,res,next){
  var context = {};
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  context.name = req.session.name;
  context.fieldCount = req.session.fieldInfo.length || 0;
  context.fieldInfo = req.session.fieldInfo || [];
  res.render('home', context);
});

app.post('/',function(req,res){
  var context = {};

  if(req.body['New User']){
    req.session.name = req.body.name;
    req.session.fieldInfo = [];
    req.session.fieldId = 0;
  }

  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  if(req.body['Add Field']){
    req.session.fieldInfo.push({"name":req.body.name, "id":req.session.fildId});
    req.session.fieldId++;
  }

  if(req.body['Delete Field']){
    req.session.fieldInfo.filter(function(e){
      return e.id != req.body.id;
    })
  }

  if(req.body['End Session']){
    req.session.destroy();
    res.render('newSession',context);
    return;
  }

  context.name = req.session.name;
  context.fielCount = req.session.fieldInfo.length;
  context.fieldInfo = req.session.fieldInfo;
  res.render('home',context);
});

app.get('/create-field',function(req,res){
  var context = {};
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  res.render('create-field', context);
});

app.get('/browse-fields',function(req,res){
  var context = {};
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  res.render('browse-fields', context);
});

app.get('/about',function(req,res){
  var context = {};
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  res.render('about', context);
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});