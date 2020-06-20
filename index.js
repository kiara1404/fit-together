const express = require('express');
const app = express();
const port = 8000;
const find = require('array-find');
const bodyParser = require("body-parser"); 
const mongo = require('mongodb');
const session = require('express-session');

require('dotenv').config();

//database connect
let db = null;
var url = 'mongodb+srv://' + process.env.DB_HOST;

mongo.MongoClient.connect(url, 
    { useUnifiedTopology: true, },
    function (err, client) {
    if (err){
         throw err
    }
    db = client.db(process.env.DB_NAME);
    console.log('Succesfully connected to MongoDB')

}
);


//set templating engine 
app.set('view engine', 'ejs');
// where are the templates stored
app.set('views', 'view');
//
app.use(bodyParser.urlencoded({extended:true}))
//session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: {
    maxAge: 1000 * 60 * 30 , // duration before the session is lost = 30 min
  }
}))

app.use(express.static('public'));
app.use(notFound);

app.post('/', add)
app.post('/dashboard', login)
app.post('/logout', logout)

app.get('/', index);
app.get('/people', people)
app.get('/dashboard', dashboard)
app.get('/add', form)
app.get('/login', loginForm)
app.get('/:id', person)

app.delete('/:id', remove)
app.listen(port, function(){
    console.log('The  server is running')
});

//homepage without session
function index(req, res) {
res.render('index');
}

// only available when the user has a session, otherwise redirect to home
function dashboard(req, res) {
  if(req.session.user){
  res.render('dashboard')
  console.log(req.session)
  }
  else{
    res.redirect('/')
  }
}

// login page render
function loginForm(req, res) {
  res.render('login');
  }

  // list with all users
function people(req, res){
  db.collection('users').find().toArray(done)

  function done(err, data) {
    if(err){
      next(err)
    } else{
       res.render('people', {data: data});
      }
    }
}
// not found redirect
function notFound (req, res) {
    res.status(404).redirect('/404')
  }
// templating
function form(req, res) {
   res.render('add');
}

// adding person to database
function add(req,res,next){
    db.collection("users").insertOne({
    name: req.body.name,
    age: req.body.age,
    place: req.body.place,
    email: req.body.email,
    password: req.body.password,
    training: req.body.training,
    level: req.body.level
    }, done)

    function done(err, data) {
        if(err) {
            next(err)
        } else {
            res.redirect('/' + data.insertedId) // route to new profile
            console.log('data input succes', req.body.name)
        }
    }
}


// detail page
function person(req,res, next){
  let id = req.params.id;
  db.collection("users").findOne({
    _id: new mongo.ObjectID(id),
  }, done);

  function done(err, data) {
    if(err) {
        next(err)
    } else {
        res.render('detail.ejs', {data:data});
        console.log('person found succesfully')
      }
    }
  }

// delete person from database
function remove(req, res, next){
  var id = req.params.id

  db.collection("users").deleteOne({
    _id: new mongo.ObjectID(id)
  }, done)

  function done(err) {
    if (err) {
      next(err)
    } else {
      res.json({status: 'ok'})
          }
      }
    }

    // login with session
function login(req, res, next) {
  let person = req.body.name

  db.collection("users").findOne({
       profileId: person
    },
    done
  );

  function done(err, data) {
    if (err) {
      next(err);
    } 
    else{
    req.session.user = {user: data}
      res.redirect('dashboard');
    }
  }
}

//kill session
function logout(req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      next(err)
    } else {
      res.redirect('/')
    }
  })
}



