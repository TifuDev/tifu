# Changelog

Changes to the software will be documented here.

The format of changelog is based in [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Version](https://semver.org/spec/v2.0.0.html)

## Unreleased

Modifications not released will be documented here

## 2.2.9 | 2021-09-25 Hytalo M. Bassi

#### Added

- notice.ts
- db.ts

#### Removed

- notice.js
- db.js

#### Changed

- jest.config.js and is now using ts-jest as preset
- app.ts to work correctly
- global.d.ts to export ProcessEnv
- middlewares.ts to work correctly
- notice.ts have lost the feature replyToId in comments due to some errors
- user.js to work correctly
- news.test.js and now imports from '@utils'. Missing '@api'
- user.test.js and now imports from '@utils'. Missing '@api'



## 2.2.8 | 2021-09-25 Hytalo M. Bassi

#### Added

- middleware.ts
- global.d.ts to have typings in global
- users.ts

#### Remove

- user.js
- middleware.js

#### Changed

- tsconfig.json to have path mappings and global types
- app.ts using types
- notice.js now exports by default the News class and seeCatalog is part of News now

## 2.2.7 | 2021-09-25 Hytalo M. Bassi

#### Added

- app.ts
- jest.config.js
- tsconfig.json

#### Removed

- app.js

#### Modified

- app.ts to use TypeScript
- .eslintignore to ignore dist/
- .gitignore to ignore dist/
- package.json jest moved to jest.config.js

## 2.2.5 | 2021-09-25 Hytalo M. Bassi

#### Added

- auth and isOwnerOfNew middlewares

#### Changed

- '/new/:path/write' body to receives metadata properties
#### Removed

- personId verification
- security.js from src/api


## 2.2.4 | 2021-09-24 Hytalo M. Bassi

#### Added

- '/new/:path/comment' router
- data property in User class

#### Changed

- app.js router using newExist middleware

#### Removed

- signTokens file

## 2.2.3 | 2021-09-24 Hytalo M. Bassi

#### Added

- middlewares.js
- launch.json
- /new/:path/react router
- validation middleware
- newExists middleware

#### Changed

- routers for news now uses newExists middleware
- router with request validation now uses validation middleware
- News class now have property *article* to save newArticle object from database

## 2.2.2 | 2021-09-23 Hytalo M. Bassi

#### Changed

- mongoose upgraded to 6.x
- mongoose.connection options removed
- cast process.env.PORT to Number

## 2.2.1 | 2021-09-23 Hytalo M. Bassi

#### Added

- .dockerignore file

#### Changed

- package manager files uses the new version of jest and eslint-plugin-import

## 2.2.0 | 2021-09-02 Hytalo M. Bassi

#### Added

- comment method to News Class
- react method to News Class

## 2.1.3 | 2021-09-02 Hytalo M. Bassi

#### Added

- editors field
- author role verification

#### Removed

- personId from news.test.js

## 2.1.2 | 2021-09-02 Hytalo M. Bassi
#### Added

- pullRequest, comments, reacions when writing NewsArticle

## 2.1.1 | 2021-09-02 Hytalo M. Bassi

#### Added

- roles field when creating user

## 2.1.0 | 2021-09-02 Hytalo M. Bassi

#### Added

- roles for Person
- pullRequest for News
- comments for News


## 2.0.0 | 2021-08-09 Hytalo M. Bassi

#### Added

- /person/get route

#### Removed

- /person/:username route

## 1.2.0 | 2021-08-09 Hytalo M. Bassi

#### Added

- static method getById

## 1.1.6 | 2021-08-09 Hytalo M. Bassi

#### Added

- cors

#### Removed

- .husky folder
- commitlint files
- standard-version dependency
