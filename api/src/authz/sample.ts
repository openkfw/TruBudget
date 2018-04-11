import { UserId } from "./types";

export const users: Array<UserId> = ["alice", "bob", "charly"];

// groups are FLAT: charly is an admin, but he's _also_ an approver and _also_ part of
// "normalFolk". This makes writing this here a bit repetitive, but on the upside it
// doesn't oppose any constraints on the organization's actual structure.
// export const groups: Array<UserGroupMapping> = [
//   { group: "normalFolk", users: users },
//   { group: "approvers", users: ["bob"] },
//   { group: "admins", users: ["charly"] }
// ];
