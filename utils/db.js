require('dotenv').config();
const mongoose = require('mongoose')

const uri =
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/tifu`

const news = mongoose.model('new', mongoose.Schema({
    title: String,
    desc: String,
    path: String,
    id: String,
    author: String,
    date: Date
}))

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

module.exports = { mongoose, news }