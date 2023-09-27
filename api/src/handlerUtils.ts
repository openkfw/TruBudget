import { ServiceUser } from "./service/domain/organization/service_user";
import { AuthenticatedRequest } from "./httpd/lib";

export const extractUser = (request: AuthenticatedRequest): ServiceUser => {
  const user: ServiceUser = {
    id: request.user.userId,
    groups: request.user.groups,
    address: request.user.address,
    metadata: request.user.metadata,
  };
  return user;
};
