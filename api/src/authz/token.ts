import { UserMetadata } from "../service/domain/metadata";

export interface AuthToken {
  userId: string;
  address: string;
  groups: string[];
  organization: string;
  organizationAddress: string;
  metadata?: UserMetadata;
}
