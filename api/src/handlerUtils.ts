import { ServiceUser } from "./service/domain/organization/service_user";
import { AuthenticatedRequest } from "./httpd/lib";

export const extractUser = (request: AuthenticatedRequest): ServiceUser => {
  const user: ServiceUser = {
    id: (request as AuthenticatedRequest).user.userId,
    groups: (request as AuthenticatedRequest).user.groups,
    address: (request as AuthenticatedRequest).user.address,
  };
  return user;
};
