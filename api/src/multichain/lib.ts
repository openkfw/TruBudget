export const ignoringStreamNotFound = async (promise: Promise<any>): Promise<any> => {
  return promise.catch(err => {
    if (err.code === -708) {
      // "Stream with this name not found: global"
      return null;
    } else {
      // Other errors are not ignored:
      throw err;
    }
  });
};
