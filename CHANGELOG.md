# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.3.0](https://github.com/hytalo-bassi/tifu/compare/v1.1.6...v2.3.0) (2021-12-28)

### Bug Fixes

- **hotfix:** user-not-found crash fixed ([61cc26d](https://github.com/hytalo-bassi/tifu/commit/61cc26d777833afc6fb882e9d214800a744b4063)), closes [#11](https://github.com/hytalo-bassi/tifu/issues/11)

## 2.2.11 | 2021-12-25 Hytalo M. Bassi

<<<<<<< HEAD

#### Changed

- .dockerignore
- Dockerfile to use yarn

## 2.2.11 | 2021-09-25 Hytalo M. Bassi

#### Added

- hash.ts

#### Removed

- hash.js

#### Changed

- global.d.ts and now have type for PORT
- user.ts to imports the hash.ts
- # app.ts to remove 'authenticatedRequest' is defined but never used warning

#### Added

- .prettierignore(prettier ignores files)
- .prettierrc.json(prettier config)
- .lintstagedrrc.json(lint-staged config)
- commitlint.config.js(commitlint config)
- commit-mgs at husky runs commitlint
- pre-commit ensure the staged files are formatted and test

#### Changed

- .eslint.js extends prettier
- package.json to add releases, husky prepare and format
  > > > > > > > wip-17/automating-commits

## 2.2.10 | 2021-09-25 Hytalo M. Bassi

#### Added

- news.test.ts
- user.test.ts

#### Removed

- news.test.js
- user.test.js

#### Changed

- tsconfig.json to be readale when importing
- jest.config.js to be able to use Path Mappings
- .eslintignore to stop ignoring tests and ignore jest config file

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
- News class now have property _article_ to save newArticle object from database

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
