// const getInformation = async (rpcClient: any) => {
//   //   let data = {};
//   try {
//     return rpcClient.getInfo();
//   } catch (error) {
//     return error;
//   }
//   //   console.log(data);
//   //   return data;
// };

import { MultichainError } from "domain/multichainError";
import { MultichainInformation } from "domain/multichainInformation";

// export default getInformation;

export async function getInformation(
  rpcClient: any,
): Promise<MultichainInformation> {
  let data: MultichainInformation;
  try {
    data = await rpcClient.getInfo();
  } catch (error: any) {
    console.log("service error: " + error);
    // data = error as MultichainError;
    throw error;
    // return error;
  }
  return data;
}
