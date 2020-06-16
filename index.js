const express = require('express');
const app = express();
const port = 8000;
const find = require('array-find');
const bodyParser = require("body-parser"); 
const slug = require("slug");
const mongo = require('mongodb')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

require('dotenv').config();

//database connect
var db = null;
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
app.get('/', index);
app.get('/people', people)
app.use(express.static('public'));
//app.use(notFound);
app.post('/', add)
app.get('/add', form)
app.get('/:id', person)
app.listen(port, function(){
    console.log('The  server is running')
});


function index(req, res) {
res.render('index');
}

function people(req, res){
  db.collection('getfit').find().toArray(done)

  function done(err, data) {
    if(err){
      next(err)
    } else{
       res.render('people', {data: data});
      }
    }
}

function notFound (req, res) {
    res.status(404).redirect('/404.html')
  }

function form(req, res) {
   res.render('add');
}

function add(req,res,next){
    db.collection("getfit").insertOne({
    name: req.body.name,
    age: req.body.age,
    place: req.body.place,
    bio: req.body.bio
    }, done)

    function done(err, data) {
        if(err) {
            next(err)
        } else {
            res.redirect('/' + data.insertedId)
            console.log('data input succes', req.body.name)
        }
    }
}



function person(req,res, next){
  let id = req.params.id;
  db.collection("getfit").findOne({
    _id: new mongo.ObjectID(id),
  }, done);

  function done(err, data) {
    if(err) {
        next(err)
    } else {
        res.render('detail.ejs', {data:data});
        console.log('person found succes')
    }
}
}


