import { HttpResponse } from "../../httpd/lib";
import { value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import { hashBase64String } from "../../subproject/controller/createWorkflowitem";

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
