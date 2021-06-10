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

**docker-compose uses environment variables to load secrets**

## Access container

`sudo docker exec -it tifu_web_1 /usr/bin/bash`
