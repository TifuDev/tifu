FROM node:latest
WORKDIR /home/node/tifu
COPY . /home/node/tifu/.
RUN npm install
EXPOSE 3000
CMD ["npm", "start" ]
