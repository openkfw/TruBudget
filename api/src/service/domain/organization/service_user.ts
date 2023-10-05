import { UserMetadata } from "../metadata";

export interface ServiceUser {
  id: string;
  groups: string[];
  address: string;
  metadata?: UserMetadata;
}
