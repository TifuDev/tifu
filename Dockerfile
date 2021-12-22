FROM node:latest
WORKDIR /home/node/tifu
COPY . /home/node/tifu/.
RUN npm ci
EXPOSE 3000
CMD ["npm", "start" ]
