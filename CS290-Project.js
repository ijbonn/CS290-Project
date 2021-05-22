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

// Home page of To-Do List
app.get('/',function(req,res,next){
  var context = {};
  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }
  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length || 0;
  context.toDo = req.session.toDo || [];
  console.log(context.toDo);
  res.render('toDo',context);
});

app.post('/',function(req,res){
  var context = {};

  if(req.body['New List']){
    req.session.name = req.body.name;
    req.session.toDo = [];
    req.session.curId = 0;
  }

  //If there is no session, go to the main page.
  if(!req.session.name){
    res.render('newSession', context);
    return;
  }

  if(req.body['Add Item']){
    req.session.toDo.push({"name":req.body.name, "id":req.session.curId});
    req.session.curId++;
  }

  if(req.body['Done']){
    req.session.toDo = req.session.toDo.filter(function(e){
      return e.id != req.body.id;
    })
  }
  
  if(req.body['Log Out']){
    req.session.destroy();
    res.render('newSession',context);
    return;
  }

  context.name = req.session.name;
  context.toDoCount = req.session.toDo.length;
  context.toDo = req.session.toDo;
  console.log(context.toDo);
  res.render('toDo',context);
});

//Get example 
app.get('/get-ex',function(req,res,next){
  var context = {};
  request('http://api.openweathermap.org/data/2.5/weather?q=corvallis&APPID=' + credentials.owmKey, function(err, response, body){
    if(!err && response.statusCode < 400){
      context.owm = body;
      res.render('get-ex',context);
    } else {
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
});

//Get and post example with nested requests
app.get('/get-post-ex',function(req,res,next){
  var context = {};
  request('http://api.openweathermap.org/data/2.5/weather?q=corvallis&APPID=' + credentials.owmKey, function(err, response, body){
    if(!err && response.statusCode < 400){
      context.owm1 = body;
      request('http://api.openweathermap.org/data/2.5/weather?q=nampa&APPID=' + credentials.owmKey, function(err, response, body){
        if(!err && response.statusCode <400){
          context.owm2 = body;
          request({
            "url":"http://httpbin.org/post",
            "method":"POST",
            "headers":{
              "Content-Type":"application/json"
            },
            "body":'{"foo":"bar","number":1}'
          }, function(err,response,body){
            if(!err && response.statusCode < 400){
              context.httpbin1 = body;
              res.render('get-post-ex',context);
            }else{
              console.log(err);
              if(response){
                console.log(response.statusCode);
              }
              next(err);
            }
          })
        }else{
          console.log(err);
          if(response){
            console.log(response.statusCode);
          }
          next(err);
        }
      })
    }else{
      console.log(err);
      if(response){
        console.log(response.statusCode);
      }
      next(err);
    }
  });
});
        
app.get('/count',function(req,res){
  var context = {};
  context.count = req.session.count || 0;  req.session.count = context.count + 1;
  res.render('count', context);
});

app.post('/count',function(req,res){
  var context = {};
  if(req.body.command === "resetCount"){
    req.session.count = 0;
    //req.session.destroy();
  } else {
    context.err = true;
  }
  if(req.session){
    context.count = req.session.count;
  } else {
    context.count = 0;
  }
  req.session.count = context.count + 1;
  res.render('count', context);
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