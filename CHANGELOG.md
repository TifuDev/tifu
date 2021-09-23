# Changelog

Changes to the software will be documented here.

The format of changelog is based in [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Version](https://semver.org/spec/v2.0.0.html)

## Unreleased

Modifications not released will be documented here

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
