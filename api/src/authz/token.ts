import { UserMetadata } from "../service/domain/metadata";

export interface AuthToken {
  userId: string;
  address: string;
  organization: string;
  metadata?: UserMetadata;
}
