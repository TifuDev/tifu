FROM node:latest
WORKDIR /home/node/tifu
COPY . /home/node/tifu/.
RUN yarn
RUN yarn build
CMD ["yarn", "start" ]
EXPOSE 3000
