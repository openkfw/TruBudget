import * as crypto from "crypto";

import { HttpResponse } from "../../httpd/lib";
import { value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";

export async function validateDocument(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const tempHash = await hashBase64String(input.base64String);
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        isIdentical: input.hash === tempHash ? true : false,
      },
    },
  ];
}

async function hashBase64String(base64String: string): Promise<string> {
  return new Promise<string>(resolve => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
}
