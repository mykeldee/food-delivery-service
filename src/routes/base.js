const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
  res.render('index', {responseData: JSON.stringify({'key1': 'value1', 'key2': 'value2'})});
  res.end();
});

router.get('/google-api-test', function (req, res) {
  res.render('google-api');
  res.end();
});

router.get('/change-password', function (req, res) {
  res.render('change-password');
  res.end();
});
module.exports = (requireAuth) => {
  return router;
}
