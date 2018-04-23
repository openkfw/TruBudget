import {
  MultichainClient,
  Stream,
  StreamTxId,
  StreamBody,
  SubprojectOnChain,
  ProjectOnChain
} from "../multichain";
import { AuthToken } from "../authz/token";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { TxId, LogEntry, Resource } from "../multichain/Client.h";
import { randomString } from "../multichain/hash";
import { AllowedUserGroupsByIntent } from "../authz/types";
import {
  SubprojectData,
  SubprojectResource,
  SubprojectUserView
} from "../multichain/resources/subproject";
import { getAllowedIntents } from "../authz/index";

export class SubprojectModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async create(token: AuthToken, body, authorized): Promise<void> {
    const expectedKeys = ["projectId", "displayName", "amount", "currency", "description"];
    // TODO sanitize input
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, body);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };
    const { projectId, currency, displayName, amount, description } = body;

    // Check Permissions
    const projectPermissions = await ProjectOnChain.getPermissions(this.multichain, projectId);
    await authorized(projectPermissions); // throws if unauthorized

    const userId = token.userId;
    const subprojectId = randomString(20);
    const logEntry: LogEntry = { issuer: userId, action: "created_subproject" };
    const data = {
      displayName,
      amount,
      currency,
      description
    };

    return SubprojectOnChain.create(
      this.multichain,
      projectId,
      subprojectId,
      getDefaultPermissions(userId),
      logEntry,
      data
    );
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
