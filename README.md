# Tifu News Website
Steps to configure a localhost to tifu

## Requirements

* MongoDB
* NodeJS
* NPM tool

## Start
Run this command when MongoDB service is running

`npm start`

## Set up Docker
`sudo docker pull mongo`

`sudo mkdir -p /mongo`

`sudo docker run -it -v mongo:/data/db --name mongo -d mongo`

## Access container
`sudo docker exec -it mongo /usr/bin/mongo`
