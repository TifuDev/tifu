require('dotenv').config();
const mongoose = require('mongoose');

const uri =
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/tifu`;
var news = mongoose.model('new', mongoose.Schema({
    _id: Number,
    title: String,
    desc: String,
    path: String,
    author: String,
    date: Date,
    downloads: Number,
    collectionId: Number
}, {
    versionKey: false
}));

var user = mongoose.model('user', mongoose.Schema({
    username: String,
    email: String,
    details: Object,
    noticeCollection: Array,
    // reftoken: String,
    passwd: String
}, {
    versionKey: false
}));

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

module.exports = {
    mongoose,
    news,
    user
};