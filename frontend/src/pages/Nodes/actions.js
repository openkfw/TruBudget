export const FETCH_NODES = "FETCH_NODES";
export const FETCH_NODES_SUCCESS = "FETCH_NODES_SUCCESS";

export const APPROVE_ORGANIZATION = "APPROVE_ORGANIZATION";
export const APPROVE_ORGANIZATION_SUCCESS = "APPROVE_ORGANIZATION_SUCCESS";

export const APPROVE_NEW_NODE_FOR_ORGANIZATION = "APPROVE_NEW_NODE_FOR_ORGANIZATION";
export const APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS = "APPROVE_NEW_NODE_FOR_ORGANIZATION_SUCCESS";

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
