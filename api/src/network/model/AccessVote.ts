import { NetworkPermission } from "./Nodes";

export type T = "none" | "basic" | "admin";
const values = ["none", "basic", "admin"];

export const basicPermissions: NetworkPermission[] = [
  "connect",
  "send",
  "receive",
  "issue",
  "create",
];
export const exclusiveAdminPermissions: NetworkPermission[] = ["mine", "activate", "admin"];
export const adminPermissions: NetworkPermission[] = [
  ...basicPermissions,
  ...exclusiveAdminPermissions,
];

export function isValid(input: string): boolean {
  return values.includes(input);
}
