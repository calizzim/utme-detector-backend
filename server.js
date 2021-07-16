//server
const express = require('express');
const app = express();

//routes
const forms = require('./routes/forms/forms')
const auth = require('./routes/auth/auth')

//middleware
app.use(express.json())
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/forms', forms)
app.use('/auth', auth)

//start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});

//have all other endpoints return a 404 error
app.all('*', (req,res) => {
    res.status(404).send({error: 'invalid endpoint'})
})