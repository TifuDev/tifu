# Tifu News Website
Steps to configure a localhost to tifu

## Requirements

* MongoDB
* NodeJS
* NPM tool

*Or using docker*

* docker-compose

## Start
Run this command when MongoDB service is running

`npm start`

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
