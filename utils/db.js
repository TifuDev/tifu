const mongoose = require('mongoose');

const uri =
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

var news = mongoose.model('new', mongoose.Schema({
    _id: Number,
    title: String,
    desc: String,
    path: String,
    author: {
        firstName: String,
        familyName: String,
        username: String,
        email: String,
        details: {
            profilePhotoUrl: String,
            bio: String,
            knowsLanguage: [String],
            nationality: String,
            gender: Number
        }
    },
    date: Date,
    dateLastmod: Date,
    downloads: Number,
    metadata: {
        thumbnailUrl: String,
        inLanguage: String,
        keywords: [String],
        accessMode: String,
        isBasedOn: [String]
    }
}, {
    versionKey: false
}));

const userSchema = mongoose.Schema({
    firstName: String,
    familyName: String,
    username: String,
    email: String,
    details: {
        profilePhotoUrl: String,
        bio: String,
        knowsLanguage: [String],
        nationality: String,
        gender: Number //0 to not know 1 to male and 2 to female
    },
    password: String
}, {versionKey: false});

userSchema.post('findOne', (person) => {
    if(person !== null)
        delete person._doc.password;
});

var user = mongoose.model('user', userSchema);

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