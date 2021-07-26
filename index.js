const express = require('express');
const app = express();

const api = require('./app/native/routes/api');
app.use('/api', api);

const frontend = require('./frontend/serve')
app.use('/', frontend)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});