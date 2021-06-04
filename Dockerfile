FROM node:latest
WORKDIR /
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "app.js"]