import { createClient } from "redis";
const { REDIS_PORT, REDIS_HOST, REDIS_USER, REDIS_PWD, REDIS_DB_NUMBER } =
  process.env;

console.log(REDIS_PORT);
const client = createClient({
  socket: {
    port: REDIS_PORT ? Number(REDIS_PORT) : 6379,
    host: REDIS_HOST,
  },
  username: REDIS_USER,
  password: REDIS_PWD,
  database: Number(REDIS_DB_NUMBER),
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

export default client;
