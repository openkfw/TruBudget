export const FETCH_NODE_PERMISSIONS = 'FETCH_NODE_PERMISSIONS';
export const FETCH_NODE_PERMISSIONS_SUCCESS = 'FETCH_NODE_PERMISSIONS_SUCCESS';

export const SHOW_ROLES_DIALOG = "SHOW_ROLES_DIALOG";
export const HIDE_ROLES_DIALOG = "HIDE_ROLES_DIALOG";

export const showRolesDialog = () => {
    return {
        type: SHOW_ROLES_DIALOG
    }
}

export const hideRolesDialog = () => {
    return {
        type: HIDE_ROLES_DIALOG
    }
}

export const fetchNodePermissions = () => {
    return {
        type: FETCH_NODE_PERMISSIONS
    }
}

