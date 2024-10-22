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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let uploadedDocuments: any[] = [];
  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === "file") {
      uploadedDocuments.push(await parseMultiPartFile(part));
    } else {
      switch (true) {
        case part.fieldname.includes("link"): {
          uploadedDocuments.push(JSON.parse(part.value as string));
          break;
        }
        case part.fieldname.includes("comment_"): {
          const index = parseInt(part.fieldname.split("_")[1]);
          uploadedDocuments[index].comment = part.value;
          break;
        }
        case part.fieldname === "apiVersion": {
          break;
        }
        case part.fieldname === "tags": {
          if (part.value === "") {
            data[part.fieldname] = [];
          } else {
            data[part.fieldname] = (part.value as string).split(",");
          }
          break;
        }
        case part.value === "null":
          data[part.fieldname] = undefined;
          break;
        case part.value === "undefined":
          data[part.fieldname] = undefined;
          break;
        default:
          data[part.fieldname] = part.value;
          break;
      }
    }
  }
  data["documents"] = uploadedDocuments;
  return data;
};
