const mongoose = require('mongoose');
const { createHash } = require('crypto');

const {
  DB_USER,
  DB_PWD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

let uri = `mongodb+srv://${DB_USER}:${DB_PWD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
if (process.env.STANDARD_CONNECTION) {
  uri = `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
}

const news = mongoose.model('new', mongoose.Schema({
  _id: Number,
  title: String,
  desc: String,
  path: String,
  pullRequest: [{
    _id: mongoose.Types.ObjectId,
    personId: String,
    diff: String,
  }],
  author: mongoose.Types.ObjectId,
  date: Date,
  dateLastmod: Date,
  downloads: Number,
  metadata: {
    thumbnailUrl: String,
    inLanguage: String,
    keywords: [String],
    accessMode: String,
    isBasedOn: [String],
  },
  content: String,
  editors: [String],
  comments: [{
    _id: mongoose.Types.ObjectId,
    personId: String,
    content: String,
    comments: [{
      _id: mongoose.Types.ObjectId,
      personId: String,
      content: String,
      reactions: [[String, Number]],
    }],
    reactions: [[String, Number]],
  }],
  reactions: [[String, Number]],
}, { versionKey: false }));

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
    gender: Number,
  },
  password: String,
  roles: [String],
}, { versionKey: false });

userSchema.post('findOne', (person) => {
  if (person !== null) delete person._doc.password;
});

// eslint-disable-next-line func-names
userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.password = createHash('sha256').update(this.password).digest('hex');
  }

  next();
});

const user = mongoose.model('user', userSchema);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on('open', () => console.log('Database connected succesfully'));

module.exports = { mongoose, news, user };
