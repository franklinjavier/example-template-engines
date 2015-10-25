var express = require('express');
var fs = require('fs');
var todos = require('./todos.json');
var jade = require('jade');
var mustache = require('mustache');
var dust = require('dustjs-linkedin');
var ejs = require('ejs');
var nunjucks = require('nunjucks');
var axios = require('axios');
var request = require('request');
var oboe = require('oboe');
var compression = require('compression');
var bodyParser = require('body-parser');

var API = 'https://www.reddit.com/subreddits/search.json?limit=100&q=lol';
var app = express();
var config = {
  url: API,
  headers: {
    'User-Agent': 'request'
  }
};

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

function getData(cb) {
  request(config, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      var locals = {todos: info.data.children};
      cb(locals);
    }
  })
}

app.get('/jade', function(req, res) {
  getData(function(locals) {
    res.send(jade.renderFile('./jade/index.jade', locals));
  });
});

app.get('/mustache', function(req, res) {
  var template = fs.readFileSync('./mustache/index.mustache', 'utf8');
  var partials = {
    item: fs.readFileSync('./mustache/item_partial.mustache', 'utf8')
  };

  getData(function(locals) {
    res.send(mustache.render(template, locals, partials));
  });
});

app.get('/nunjucks', function(req, res) {
  getData(function(locals) {
    nunjucks.render('./nunjucks/index.html', locals, function(err, result) {
      if(err) {
        return res.send(err.message);
      }
      res.send(result);
    });
  });

});

app.get('/ejs', function(req, res) {
  var template = fs.readFileSync('./ejs/index.ejs', 'utf8');
  getData(function(locals) {
    locals.filename = './ejs/index.ejs';
    res.send(ejs.render(template, locals));
  });
});

app.listen(3000);
console.log('Example is listening on http://127.0.0.1:3000');
