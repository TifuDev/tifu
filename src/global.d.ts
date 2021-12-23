declare namespace NodeJS {
  export interface ProcessEnv {
    STANDARD_CONNECTION: string;
    NODE_ENV: string;
    DB_HOST: string;
    DB_USER: string;
    DB_PWD: string;
    DB_PORT: string;
    DB_NAME: string;
    ACCTOKEN_LIFE: string,
    ACCTOKEN_SECRET: string
  }
}