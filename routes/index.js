var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true }) 
var firebase = require("firebase")

var config = {
  apiKey: 'AIzaSyBnm1Qn1S_JjbdnluH2hwnF34hRbuyuLwo',
  authDomain: 'shopping-bfcfb.firebaseapp.com',
  databaseURL: 'https://shopping-bfcfb.firebaseio.com',
  projectId: 'shopping-bfcfb',
  storageBucket: 'shopping-bfcfb.appspot.com',
  messagingSenderId: '581074187585'
};

const db = firebase.initializeApp(config);


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/auth', function(req, res, next) {
  const { email, password } = req.body
  console.log(email)
  console.log(password)
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(user => {
    console.log('user at authaction',user)
    if(firebase.auth().currentUser.emailVerified) {
      firebase.database().ref(`/users/${user.user.uid}`)
      .on('value', snapshot => {
          console.log('snapshot at authaction',snapshot.val());
      
        user={
          name:snapshot.val().name, 
          city:snapshot.val().city, 
          country:snapshot.val().country,
          email: snapshot.val().email,
          phone: snapshot.val().phone,
          street:snapshot.val().street,
          zip:snapshot.val().zip,
          uid:user.user.uid
        }
        res.send({'status': 'success', user})
      })
    } else {
      res.send({'status': 'failed'})
    }
  })
  .catch((err)=>{
    console.log('err: ', err)
    res.send({'status': 'failed'})
  })

});

router.get('/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
module.exports = router;
