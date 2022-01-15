declare namespace NodeJS {
  export interface ProcessEnv {
    STANDARD_CONNECTION: string;
    NODE_ENV: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PWD: string;
    DB_PORT: string;
    DB_NAME: string;
    ACCTOKEN_LIFE: string;
    ACCTOKEN_SECRET: string;
    PORT: string;
    REDIS_PORT: string;
    REDIS_HOST: string;
    REDIS_USER: string;
    REDIS_PWD: string;
    REDIS_DB_NUMBER: string;
  }
}
