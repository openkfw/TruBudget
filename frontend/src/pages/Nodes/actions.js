export const FETCH_NODES = "FETCH_NODES";
export const FETCH_NODES_SUCCESS = "FETCH_NODES_SUCCESS";

export const APPROVE_ORGANIZATION = "APPROVE_ORGANIZATION";
export const APPROVE_ORGANIZATION_SUCCESS = "APPROVE_ORGANIZATION_SUCCESS";

export const APPROVE_NEW_NODE_FOR_ORGANIZATION = "APPROVE_NEW_NODE_FOR_ORGANIZATION";
export const APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS = "APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS";

export const DECLINE_NODE = "DECLINE_NODE";
export const DECLINE_NODE_SUCCESS = "DECLINE_NODE_SUCCESS";

export const REGISTER_NEW_ORGANIZATION = "REGISTER_NEW_ORGANIZATION";

export function fetchNodes(showLoading = false) {
  return {
    type: FETCH_NODES,
    showLoading
  };
}

export function approveNewOrganization(organization, showLoading = false) {
  return {
    type: APPROVE_ORGANIZATION,
    organization,
    showLoading
  };
}
export function approveNewNodeForExistingOrganization(address, showLoading = false) {
  return {
    type: APPROVE_NEW_NODE_FOR_ORGANIZATION,
    address,
    showLoading
  };
}
export function declineNode(node, showLoading = false) {
  return {
    type: DECLINE_NODE,
    node,
    showLoading
  };
}
export function registerNewOrganization(organization, address) {
  return {
    type: REGISTER_NEW_ORGANIZATION,
    organization,
    address
  };
}
