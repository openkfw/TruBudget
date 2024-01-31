import {
  getAllStreamItems,
  getFromTxOutData,
  getStreamItemByTx,
} from "./helper/migrationHelper";

var _ = require("lodash");

export const difference = (object: any, base: any) => {
  const changes = (object: any, base: any) => {
    return _.transform(object, function (result: any, value: any, key: any) {
      if (!_.isEqual(value, base[key])) {
        result[key] =
          _.isObject(value) && _.isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  };
  return changes(object, base);
};

export const assertChainEquals = async (
  sourceChain: any,
  destinationChain: any
) => {
  const clone = await getAllStreamItems(destinationChain, "users");
  const orginal = await getAllStreamItems(sourceChain, "users");
  if (!orginal || !clone) {
    console.log("User Assertion Failed! Original or clone is undefined");
    return false;
  }

  if (orginal.length > clone.length) {
    console.log(
      `User Assertion Failed! Original and clone have not the same length. Original is: ${orginal.length}, clone is: ${clone.length}`
    );

    return false;
  }
  for (const originalItem of orginal) {
    for (const cloneItem of clone) {
      const diff = difference(originalItem.data, cloneItem.data);
      if (
        !diff ||
        Object.keys(diff).length !== 0 ||
        !Object.getPrototypeOf(diff) === Object.prototype
      ) {
        console.log(
          "User Assertion Failed! Original and clone are not the same! Original is: ",
          JSON.stringify(originalItem),
          "Clone is: ",
          JSON.stringify(cloneItem),
          "Difference is: ",
          JSON.stringify(diff)
        );

        return false;
      }
    }
  }

  return true;
};

export interface AssertParams {
  sourceChain: any;
  destinationChain: any;
  stream: string;
  sourceChainTx: string;
  destinationChainTx: string;
  additionalData?: any;
}

export const assertStreamItem = async ({
  sourceChain,
  destinationChain,
  stream,
  sourceChainTx,
  destinationChainTx,
}: AssertParams) => {
  let clone = await getStreamItemByTx(
    destinationChain,
    stream,
    destinationChainTx
  );
  let original = await getStreamItemByTx(sourceChain, stream, sourceChainTx);
  if (!original || !clone) {
    throw new Error("User Assertion Failed! Original or clone is undefined");
  }

  if (
    original.data &&
    original.data.hasOwnProperty("vout") &&
    original.data.hasOwnProperty("txid")
  ) {
    original = await getFromTxOutData(sourceChain, original);
  }

  if (
    clone.data &&
    clone.data.hasOwnProperty("vout") &&
    clone.data.hasOwnProperty("txid")
  ) {
    clone = await getFromTxOutData(destinationChain, clone);
  }

  const diff = difference(original.data, clone.data);

  if (
    !diff ||
    Object.keys(diff).length !== 0 ||
    !Object.getPrototypeOf(diff) === Object.prototype
  ) {
    console.log(
      "User Assertion Failed! Original and clone are not the same! Original is: ",
      JSON.stringify(original),
      "Clone is: ",
      JSON.stringify(clone),
      "Difference is: ",
      JSON.stringify(diff)
    );
    throw new Error(
      `User Assertion Failed! Original and clone are not the same! Difference is:
      ${JSON.stringify(diff)}`
    );
  }

  return true;
};
