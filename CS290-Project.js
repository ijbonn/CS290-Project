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
  if(!req.session.userName){
    res.render('newSession', context);
    return;
  }
  context.userName = req.session.userName;
  context.fieldCount = req.session.fieldInfo.length || 0;
  context.fieldInfo = req.session.fieldInfo || [];
  console.log(context.fieldInfo);
  res.render('home', context);
});

app.post('/',function(req,res){
  var context = {};

  if(req.body['New User']){
    req.session.userName = req.body.userName;
    var defaultFields = require('./public/json/defaultFields.json');
    req.session.fieldInfo = defaultFields;
    req.session.fieldId = 3;
  }

  if(!req.session.userName){
    res.render('newSession', context);
    return;
  }

  if(req.body['End Session']){
    req.session.destroy();
    res.render('newSession',context);
    return;
  }

  context.userName = req.session.userName;
  context.fieldCount = req.session.fieldInfo.length;
  context.fieldInfo = req.session.fieldInfo;
  res.render('home',context);
});

function fetchField(fArray,fId){
  const foundField = fArray.filter(field => field.id == fId);
  var singleField = new Object();
  singleField = foundField[0];
  return singleField;
}

app.get('/create-field',function(req,res){
  var context = {};
  if(!req.session.userName){
    res.render('newSession', context);
    return;
  }
  context.userName = req.session.userName;
  res.render('create-field', context);
});

app.post('/create-field',function(req,res){
  var context = {};
  
  let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
  currentDate = year + '-' + month + '-' + date;

  if(req.body['Add Field']){
    req.session.fieldInfo.push({"id":req.session.fieldId, "fName":req.body.fieldName, "fState":req.body.fieldState, 
      "fCity":req.body.fieldCity, "fCrop":req.body.fieldCrop, "fAcres":req.body.fieldAcres, "fPDate":req.body.fieldPlantingDate,
      "cUser":req.session.userName, "cDate":currentDate});
    //const newField = req.session.fieldInfo.filter(field => field.id == req.session.fieldId);
    //console.log(newField);
    var newField = fetchField(req.session.fieldInfo,req.session.fieldId)
    req.session.fieldId++;
    context.fieldInfo = newField;
    context.userName = req.session.userName;
    res.render('field-details', context);
    return;    
  }
  context.userName = req.session.userName;
  res.render('create-field',context);
});

app.get('/browse-fields',function(req,res){
  var context = {};
  if(!req.session.userName){
    res.render('newSession', context);
    return;
  }
  context.userName = req.session.userName;
  context.fieldInfo = req.session.fieldInfo;
  res.render('browse-fields', context);
});

app.post('/browse-fields',function(req,res){
  var context = {};
  
  if(req.body['Details']){
    //const targetField = req.session.fieldInfo.filter(field => field.id == req.body.id);
    var targetField = fetchField(req.session.fieldInfo,req.body.id)
    //context.fieldInfo = targetField;
    context.fieldInfo = targetField;
    context.userName = req.session.userName;
    res.render('field-details', context);
    return;    
  }
  context.fieldInfo = req.session.fieldInfo;
  context.userName = req.session.userName;
  res.render('browse-field',context);
});

app.get('/about',function(req,res){
  var context = {};
  if(!req.session.userName){
    res.render('newSession', context);
    return;
  }
  context.userName = req.session.userName;
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