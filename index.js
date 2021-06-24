//server
const express = require('express');
const util = require('util');
const app = express();

//routes
const forms = require('./routes/forms/forms')

//database
const db = require('mongoose');

//middleware
app.use(express.json());
app.use('/forms', forms);

//start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});