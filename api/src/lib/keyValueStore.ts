/**
 * @description Simple data key/value store
 */
const store = {};

export const saveValue = (key: string, value: {}, exp: Date | number): void => {
  if (!key || !value) {
    throw Error("key and value are required");
  }

  const expMs = exp instanceof Date ? exp.getTime() : exp;
  store[key] = { ...value, exp: expMs };
};

export const getValue = (key: string): unknown => store[key];

export const clearValue = (key: string): void => {
  if (store[key]) {
    delete store[key];
  }
};

export const clearExpiredKeys = (): void => {
  const now = new Date();
  const nowMs = now.getTime();
  Object.keys(store).forEach((key) => {
    // key is expired
    if (store?.[key]?.exp && nowMs > store?.[key]?.exp) {
      console.log("Clearing value" + key);
      clearValue(key);
    }
  });
};

setInterval(clearExpiredKeys, 1000 * 60);

export const getAllValues = (): any => store;
