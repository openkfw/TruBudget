function d2h(d) {
  return d.toString(16);
}

function h2d(h) {
  return parseInt(h, 16);
}

export const stringToHex = (string = '') => {
  let str = '';
  let i = 0;
  const tmpLen = string.length;
  let c;

  for (; i < tmpLen; i += 1) {
    c = string.charCodeAt(i);
    str += d2h(c);
  }
  return str;
};

export const hexToString = (hex) => {
  const hexArray = hex.match(/.{2}/g);
  let str = '';
  let i = 0;
  const tmpLen = hexArray.length;
  let c;

  for (; i < tmpLen; i += 1) {
    c = String.fromCharCode(h2d(hexArray[i]));
    str += c;
  }

  return str;
};
export const objectToHex = object => stringToHex(JSON.stringify(object));
export const hexToObject = hex => JSON.parse(hexToString(hex));
