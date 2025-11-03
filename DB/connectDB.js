const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.getURL(),{
    useNewUrlParser: true
})
.then(()=>{
    console.log('connected to DB');
})
.catch(err => console.log('Not connected to DB', err));

module.exports = {mongoose};