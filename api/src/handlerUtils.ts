import { MultipartFile } from "@fastify/multipart";

import { AuthenticatedRequest } from "./httpd/lib";
import { ServiceUser } from "./service/domain/organization/service_user";

export const extractUser = (request: AuthenticatedRequest): ServiceUser => {
  const user: ServiceUser = {
    id: request.user.userId,
    groups: request.user.groups,
    address: request.user.address,
    metadata: request.user.metadata,
  };
  return user;
};

export const parseMultiPartFile = async (part: MultipartFile): Promise<any> => {
  const id = "";
  const buffer = await part.toBuffer();
  // TODO downstream functionality expects base64, but we should work with buffer directly in the future
  const base64 = buffer.toString("base64");
  const fileName = part.filename;
  return { id, base64, fileName };
};

export const parseMultiPartRequest = async (request: AuthenticatedRequest): Promise<any> => {
  let data = {};
  let uploadedDocuments: any[] = [];
  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === "file") {
      uploadedDocuments.push(await parseMultiPartFile(part));
    } else {
      if (part.fieldname.includes("comment_")) {
        const index = parseInt(part.fieldname.split("_")[1]);
        uploadedDocuments[index].comment = part.value;
        continue;
      }
      if (part.fieldname === "apiVersion") {
        continue;
      } else if (part.fieldname === "tags") {
        if (part.value === "") {
          data[part.fieldname] = [];
        } else {
          data[part.fieldname] = (part.value as string).split(",");
        }
        continue;
      }
      if (part.value === "null") {
        data[part.fieldname] = undefined;
        continue;
      }
      if (part.value === "undefined") {
        data[part.fieldname] = undefined;
        continue;
      }
      data[part.fieldname] = part.value;
    }
  }
  data["documents"] = uploadedDocuments;
  return data;
};
