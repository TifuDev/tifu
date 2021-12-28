# Tifu News Website

Steps to configure a localhost to tifu

## Requirements

- MongoDB
- NodeJS
- NPM tool

_Or using docker_

- docker-compose

## Start

Run this command when MongoDB service is running

`yarn`

`yarn prepare`

`yarn watch`

## Starting containers

`sudo docker-compose up -d`

## Setting environment variables

`echo 'VAR=<var>' >> .env`

## Create a secret to access token

`echo ACCTOKEN_SECRET=$(openssl rand -base64 32) >> tifu/.env`

The secret can not be shared in any circumstances. This key is used to make json web tokens

**docker-compose uses environment variables to load secrets**

## Access container

`sudo docker exec -it tifu_web_1 /usr/bin/bash`

### Developing Tifu

#### Git Strategies

Git is powerfull tool when talking about versioning. But, the bad usage of git can make too hard the developing process.
So, to avoid this problem, heres the guidelines to use git.

[SemVer](https://semver.org/) is a Semantic Versioning Specification. You SHOULD read the specification when pulling new versions of the software

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#specification) is a specification about how you will commit new versions of the software.

[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) is why you MUST have changelogs about your software.

The branch master is the most important branch in all project. This branch afect all production and you SHOULD NOT pull your code directly to master. Follow SemVer specification and create a new branch with the version.

#### Linting

The lint process is one of the must important part of developing a new feature. Make a code readable will make the code easy to understand.
For this process we make use of the [ESLint](https://eslint.org/) tool.

#### Testing

The tests will make you have sure your codes will not break another components or features. You MUST test after linting your code and before commiting them.
Making new tests are RECOMMENDED to guarantee the software works. The testing tool we are using is [Jest](https://jestjs.io/)

#### Commiting

We use some tools to help developers commit their changes correctly.

`yarn commit`

This is essential when commiting your changes

The script asks the developer the type of the change, it's scope and a subject.
After it will lint to ensure it maintains a commit message structure.
And after all, lint the code and format if needed.
