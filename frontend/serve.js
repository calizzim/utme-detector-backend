const express = require('express');
const path = require('path');


app = express.Router();

app.use(express.static(path.join(__dirname,'./build')));

app.all('/', (req, res) => {
  res.status(200).sendFile(path.join(__dirname,'./build/index.html'));
});

module.exports = app;