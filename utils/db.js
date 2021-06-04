require('dotenv').config();
const mongoose = require('mongoose');

const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

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
    pwd: String
}, {
    versionKey: false
}));

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.on('open', () => console.log('Database connected succesfully'));

module.exports = {
    mongoose,
    news,
    user
};