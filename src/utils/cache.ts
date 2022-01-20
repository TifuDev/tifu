import client from "@utils/redis";

/**
 * Add key to cache
 * @param {string} key Key to assign
 * @param {object} value Object to be cached
 * @returns {Promise<unknown>} Promise
 */
export function add(key: string, value: object): Promise<unknown> {
  return client.set(key, JSON.stringify(value));
}

/**
 *
 * @param {string} key Search for key in cache
 * @returns {Promise<string>} Parsed value
 * @throws Will thrown if no value or client reject
 */
export function get(key: string): Promise<object> {
  return new Promise((resolve, reject) => {
    client
      .get(key)
      .then((value) => {
        if (value === null) return reject(new Error("No value"));

        return resolve(JSON.parse(value));
      })
      .catch((err) => reject(err));
  });
}
