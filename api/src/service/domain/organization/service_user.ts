import { UserMetadata } from "../metadata";

export interface ServiceUser {
  id: string;
  address: string;
  metadata?: UserMetadata;
}

export interface DomainUser {
  id: string;
  groups: string[];
  address: string;
  metadata?: UserMetadata;
}
