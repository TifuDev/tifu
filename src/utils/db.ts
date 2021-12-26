import { Schema, model, connect, Types, connection } from "mongoose";
import { createHash } from "crypto";

const { DB_USER, DB_HOST, DB_PORT, DB_NAME } = process.env;

const DB_PWD = encodeURIComponent(process.env.DB_PWD as string);
let uri = `mongodb+srv://${DB_USER}:${DB_PWD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
if (process.env.STANDARD_CONNECTION) {
  uri = `mongodb://${DB_USER}:${DB_PWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
}

declare interface commentType {
  _id: string;
  personId: string;
  content: string;
  comments: commentType[];
  reactions: [[string, number]];
}

declare interface newType {
  _id: number;
  title: string;
  desc: string;
  path: string;
  pullRequest: [
    {
      _id: string;
      personId: string;
      diff: string;
    }
  ];
  author: string;
  date: Date;
  dateLastmod: Date;
  downloads: number;
  metadata: {
    thumbnailUrl: string;
    inLanguage: string;
    keywords: [string];
    accessMode: string;
    isBasedOn: [string];
  };
  content: string;
  editors: [string];
  comments: commentType[];
  reactions: [[string, number]];
}

declare interface userType {
  firstName: string;
  familyName: string;
  username: string;
  email: string;
  details: {
    profilePhotoUrl: string;
    bio: string;
    knowsLanguage: [string];
    nationality: string;
    gender: number;
  };
  password: string;
  roles: [string];
}

export const news = model<newType>(
  "new",
  new Schema<newType>(
    {
      _id: Number,
      title: String,
      desc: String,
      path: String,
      pullRequest: [
        {
          _id: Types.ObjectId,
          personId: String,
          diff: String,
        },
      ],
      author: Types.ObjectId,
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
      comments: [
        {
          _id: Types.ObjectId,
          personId: String,
          content: String,
          comments: [
            {
              _id: Types.ObjectId,
              personId: String,
              content: String,
              reactions: [[String, Number]],
            },
          ],
          reactions: [[String, Number]],
        },
      ],
      reactions: [[String, Number]],
    },
    { versionKey: false }
  )
);

const userSchema = new Schema<userType>(
  {
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
  },
  { versionKey: false }
);

userSchema.post("findOne", (person: { _doc: { password: unknown } } | null) => {
  if (person !== null) delete person._doc.password;
});

userSchema.pre("save", function (next) {
  if (this.password && this?.isModified("password")) {
    this.password = createHash("sha256").update(this.password).digest("hex");
  }

  next();
});

export const user = model<userType>("user", userSchema);

connect(uri);

connection.on("open", () => console.log("Database connected succesfully"));

module.exports = { news, user };
