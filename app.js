var express     = require('express');
var app         = express();
var apiRouter   = require('./server/api');

app.use(express.static('www'));
app.use('/api', apiRouter);

app.listen(3000, function(){
    console.log('Server is running on port 3000...');
});
