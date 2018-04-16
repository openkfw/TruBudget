const array1 = {
  "global.intent.list": ["mstein"],
  "global.createProject": ["mstein"]
};
const array2 = {
  "global.intent.list": ["root", "mstein"],
  "global.createProject": ["root", "mstein"]
};

const testIt = () => {
  Object.keys(array2).map(key => {
    array2[key].map(user => {
      const x = array1[key].find(requestedUser => user === requestedUser);
      if (x) {
        console.log(`Permissions ${key} for ${x} already granted`);
        return true;
      }
      return false;
    });
    console.log("------------------------");
  });
};
testIt();
