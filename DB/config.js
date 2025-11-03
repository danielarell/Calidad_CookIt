require('dotenv').config();


module.exports = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    getURL: function(){
        return `mongodb+srv://${this.user}:${this.password}@dasw.vruf9nc.mongodb.net/${this.dbName}?retryWrites=true&w=majority&appName=dasw`;
    }
};