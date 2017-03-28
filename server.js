// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
let MongoClient = require('mongodb').MongoClient;

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use((req, res, next) => {
  req.database = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  }
  next();
});
app.use((req, res, next) => {
  MongoClient.connect('mongodb://'+req.database.user+':'+req.database.password+'@ds137530.mlab.com:37530/the-smoking-gnu')
  .then(db => {
    req.db = db;
    next();
  })
})

app.get("/new/http://:url", function (request, response) {
  if(!/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.(com)?$/.test(request.params.url)) {
    response.send(402, 'url not in the correct form');
    return;
  }
  const valuesToAdd = {raw: 'http://'+request.params.url, short: hash(request.params.url).toString()};
  request.db.collection('urls')
            .insertOne(valuesToAdd)
            .then(result => response.send(valuesToAdd))
})

app.get("/:url", function (request, response, next) {
  if(!request.params.url || 'favicon.ico' === request.params.url) {
    response.status(200);
    return;
  }
  request.db.collection('urls')
           .findOne({short:request.params.url})
           .then(doc => {
              if(doc) {
                response.redirect(doc.raw);
              } else {
                response.send(404, 'no doc found')
              }
            });
});
  
function hash(s) {

  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
