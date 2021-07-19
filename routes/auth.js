var express = require('express');
var router = express.Router();
var firebase = require('firebase');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function (req, res, next) {
  const { email, password } = req.body
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
      if (firebase.auth().currentUser.emailVerified) {
        firebase.database().ref(`/users/${user.user.uid}`)
          .on('value', snapshot => {
            user = {
              name: snapshot.val().name,
              city: snapshot.val().city,
              country: snapshot.val().country,
              email: snapshot.val().email,
              phone: snapshot.val().phone,
              street: snapshot.val().street,
              zip: snapshot.val().zip,
              uid: user.user.uid
            }
            res.send({ 'status': 'success', user });
          });
      } else {
        res.send({ 'status': 'failed' });
      }
    })
    .catch((err) => {
      res.send({ 'status': 'failed', error: err });
    });

});

module.exports = router;
