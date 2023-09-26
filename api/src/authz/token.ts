import { UserMetadata } from "../service/domain/metadata";

// TODO compare api/src/service/domain/organization/auth_token.ts - is one of these unused?
export interface AuthToken {
  userId: string;
  address: string;
  groups: string[];
  organization: string;
  organizationAddress: string;
  metadata?: UserMetadata;
}
