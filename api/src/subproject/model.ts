import { MultichainClient, Stream, StreamTxId, StreamBody } from "../multichain";
import { AuthToken } from "../authz/token";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { TxId } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import { AllowedUserGroupsByIntent } from "../authz/types";

export class SubProjectModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async createSubProject(token: AuthToken, body, authorized): Promise<string> {
    const expectedKeys = ["projectId", "displayName", "amount", "currency"];
    // TODO sanitize input
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, body);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const { projectId, currency, displayName, amount } = body;

    // Check Permissions
    const projectPermissions = await this.multichain.latestValuesForKey(projectId, "_permissions");
    await authorized(projectPermissions); // throws if unauthorized

    // Create subproject object
    const subprojectId = randomString(20);
    const userId = token.userId;
    const permissions = getDefaultPermissions(userId);
    const initialLogEntry = { issuer: userId, action: "created_subproject" };
    const subproject = {
      _metadata: {
        id: subprojectId,
        name: displayName,
        status: "open",
        amount,
        currency
      },
      _log: [initialLogEntry],
      _permissions: permissions
    };

    // Store subproject
    const txId: TxId = await this.multichain.updateStreamItem(
      projectId,
      ["subproject", subprojectId],
      subproject
    );
    return txId;
  }
}

const getDefaultPermissions = (userId: String): AllowedUserGroupsByIntent => {
  const defaultIntents: Object = {
    "subproject.permission.list": [userId],
    "subproject.permission.grant": [userId],
    "subproject.permission.revoke": [userId],
    "subproject.viewSummary": [userId],
    "subproject.viewDetails": [userId],
    "subproject.assign": [userId],
    "subproject.update": [userId],
    "subproject.close": [userId],
    "subproject.archive": [userId],
    "subproject.createWorkflowitem": [userId]
  };
  return defaultIntents;
};
