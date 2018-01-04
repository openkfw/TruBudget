export const FETCH_NODE_PERMISSIONS = 'FETCH_NODE_PERMISSIONS';
export const FETCH_NODE_PERMISSIONS_SUCCESS = 'FETCH_NODE_PERMISSIONS_SUCCESS';

export const SHOW_ROLES_DIALOG = "SHOW_ROLES_DIALOG";
export const HIDE_ROLES_DIALOG = "HIDE_ROLES_DIALOG";

export const SHOW_USERS_DIALOG = "SHOW_USERS_DIALOG";
export const HIDE_USERS_DIALOG = "HIDE_USERS_DIALOG";

export const ROLE_NAME = "ROLE_NAME";
export const ROLE_ORGANIZATION = "ROLE_ORGANIZATION";
export const ROLE_READ_PERMISSION = "ROLE_READ_PERMISSION";
export const ROLE_WRITE_PERMISSION = "ROLE_WRITE_PERMISSION";
export const ROLE_ADMIN_PERMISSION = "ROLE_ADMIN_PERMISSION";


export const USER_NAME = "USER_NAME";
export const USER_FULL_NAME = "USER_FULL_NAME";
export const USER_PASSWORD = "USER_PASSWORD";
export const USER_AVATAR = "USER_AVATAR";
export const USER_ROLE = "USER_ROLE";

export const ADD_USER = "ADD_USER";
export const ADD_USER_SUCCESS = "ADD_USER_SUCCESS";

export const ADD_ROLE = "ADD_ROLE";
export const ADD_ROLE_SUCCESS = "ADD_ROLE_SUCCESS";


export const SHOW_ADMIN_LOGIN = "SHOW_ADMIN_LOGIN";
export const HIDE_ADMIN_LOGIN = "HIDE_ADMIN_LOGIN";

export const ADMIN_USERNAME = "ADMIN_USERNAME";
export const ADMIN_PASSWORD = "ADMIN_PASSWORD";

export const LOGIN_ADMIN_USER = "LOGIN_ADMIN_USER";
export const LOGIN_ADMIN_USER_SUCCESS = "LOGIN_ADMIN_USER_SUCCESS";
export const LOGIN_ADMIN_USER_ERROR = "LOGIN_ADMIN_USER_ERROR";



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

export const showUsersDialog = () => {
    return {
        type: SHOW_USERS_DIALOG
    }
}

export const hideUsersDialog = () => {
    return {
        type: HIDE_USERS_DIALOG
    }
}


export const fetchNodePermissions = () => {
    return {
        type: FETCH_NODE_PERMISSIONS
    }
}


export const setUsername = (username) => {

    return {
        type: USER_NAME,
        username
    }
}

export const setUserFullName = (fullName) => {
    return {
        type: USER_FULL_NAME,
        fullName
    }
}

export const setUserPassword = (password) => {
    return {
        type: USER_PASSWORD,
        password
    }
}

export const setUserAvatar = (avatar) => {
    return {
        type: USER_AVATAR,
        avatar
    }
}


export const setUserRole = (role) => {
    return {
        type: USER_ROLE,
        role
    }
}

export const addUser = (username, fullName, avatar, password, role) => {
    return {
        type: ADD_USER,
        username,
        fullName,
        avatar,
        password,
        role
    }
}

export const addRole = (name, organization, read, write, admin) => {
    return {
        type: ADD_ROLE,
        name,
        organization,
        read,
        write,
        admin
    }
}


export const setRoleName = (name) => {
    return {
        type: ROLE_NAME,
        name
    }
}

export const setRoleOrganization = (organization) => {
    return {
        type: ROLE_ORGANIZATION,
        organization
    }
}

export const setRoleReadPermission = (readPermissionSelected) => {
    return {
        type: ROLE_READ_PERMISSION,
        readPermissionSelected
    }
}
export const setRoleWritePermission = (writePermissionSelected) => {
    return {
        type: ROLE_WRITE_PERMISSION,
        writePermissionSelected
    }
}
export const setRoleAdminPermission = (adminPermissionSelected) => {
    return {
        type: ROLE_ADMIN_PERMISSION,
        adminPermissionSelected
    }
}

export const hideAdminLogin = () => {
    return {
        type: HIDE_ADMIN_LOGIN
    }
}

export const showAdminLogin = () => {
    return {
        type: SHOW_ADMIN_LOGIN
    }
}

export const setAdminUsername = (username) => {
    return {
        type: ADMIN_USERNAME,
        username
    }
}

export const setAdminPassword = (password) => {
    return {
        type: ADMIN_PASSWORD,
        password
    }
}

export const loginAdminUser = (username, password) => {
    return {
        type: LOGIN_ADMIN_USER,
        username,
        password
    }
}