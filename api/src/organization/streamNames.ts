import { Organization } from "../network/model/Nodes";

const maxStreamNameBytes = 16;

export function organizationStreamName(organization: Organization): string {
  return streamName(organization, "org");
}

function streamName(organization: Organization, prefix: string): string {
  let name = `${prefix}:${organization}`.replace(/ /g, "_").substring(0, maxStreamNameBytes);
  while (Buffer.byteLength(name) > maxStreamNameBytes) {
    name = name.substring(0, name.length - 1);
  }
  return name;
}
