/**
 * @description Simple data key/value store
 */
const store = {};

export const saveValue = (key: string, value: unknown): void => {
  if (!key || !value) {
    throw Error("key and value are required");
  }

  store[key] = value;
};

export const getValue = (key: string): unknown => store[key];

export const getAllValues = (): any => store;
