import dayjs from "dayjs";
import { fromJS } from "immutable";

import "dayjs/locale/de";
import "dayjs/locale/fr";
import "dayjs/locale/ka";
import "dayjs/locale/pt";

import strings from "../../localizeStrings";
import { SAVE_EMAIL_ADDRESS_SUCCESS } from "../Navbar/actions";

import {
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGOUT_SUCCESS,
  CHECK_EMAIL_SERVICE_FAILURE,
  CHECK_EMAIL_SERVICE_SUCCESS,
  CHECK_EXPORT_SERVICE_FAILURE,
  CHECK_EXPORT_SERVICE_SUCCESS,
  FETCH_ADMIN_USER_SUCCESS,
  FETCH_EMAIL_ADDRESS_SUCCESS,
  FETCH_USER_SUCCESS,
  INIT_LANGUAGE,
  LOGIN_ERROR,
  LOGIN_LOADING,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  SET_LANGUAGE,
  STORE_EMAIL,
  STORE_PASSWORD,
  STORE_USERNAME
} from "./actions";

export const defaultState = fromJS({
  adminLoginFailed: false,
  allowedIntents: [],
  avatar: "/lego_avatar_female2.jpg",
  avatarBackground: "/avatar_back.jpeg",
  disabledUsers: [],
  displayName: "",
  emailAddress: "",
  emailServiceAvailable: true,
  enabledUsers: [],
  exportServiceAvailable: false,
  groupList: [],
  groups: [],
  id: "",
  isUserLoggedIn: false,
  language: "en-gb",
  loading: false,
  loginError: false,
  organization: "",
  password: "",
  user: [],
  userDisplayNameMap: {},
  username: "",
  email: ""
});

const setTimeLocale = (language) => {
  switch (language) {
    // daysjs excpects en instead of en-gb.
    // Changing the language preset would break existing clients because it it saved in the clients local storage
    case "en-gb":
      dayjs.locale("en");
      break;
    default:
      dayjs.locale(language);
      break;
  }
};

export const changeLanguage = (state) => {
  const language = state.get("language");
  setTimeLocale(language);
  strings.setLanguage(language);
};

export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case STORE_USERNAME:
      return state.set("username", action.username);
    case FETCH_EMAIL_ADDRESS_SUCCESS:
      return state.set("emailAddress", action.emailAddress);
    case SAVE_EMAIL_ADDRESS_SUCCESS:
      return state.set("emailAddress", action.emailAddress);
    case CHECK_EMAIL_SERVICE_FAILURE:
      return state.set("emailServiceAvailable", false);
    case CHECK_EMAIL_SERVICE_SUCCESS:
      return state.set("emailServiceAvailable", true);
    case CHECK_EXPORT_SERVICE_FAILURE:
      return state.set("exportServiceAvailable", false);
    case CHECK_EXPORT_SERVICE_SUCCESS:
      return state.set("exportServiceAvailable", true);
    case STORE_PASSWORD:
      return state.set("password", action.password);
    case FETCH_USER_SUCCESS: {
      const userDisplayNameMap = {};
      const enabledUsers = [];
      const disabledUsers = [];
      const groupList = [];
      action.user.forEach((user) => {
        userDisplayNameMap[user.id] = user.displayName;
        if (!user.isGroup) {
          user.permissions["user.authenticate"].includes(user.id) ? enabledUsers.push(user) : disabledUsers.push(user);
        } else {
          groupList.push(user);
        }
      });
      return state.merge({
        user: fromJS(action.user),
        groupList: fromJS(groupList),
        userDisplayNameMap: fromJS(userDisplayNameMap),
        enabledUsers: fromJS(enabledUsers),
        disabledUsers: fromJS(disabledUsers)
      });
    }
    case FETCH_ADMIN_USER_SUCCESS:
      return state.merge({
        loggedInAdminUser: action.user,
        isUserLoggedIn: action.user.isUserLoggedIn
      });

    case LOGIN_SUCCESS: {
      const user = action.user;
      return state.merge({
        isUserLoggedIn: action.isUserLoggedIn,
        id: user.id,
        displayName: user.displayName,
        organization: user.organization,
        allowedIntents: fromJS(user.allowedIntents),
        groups: fromJS(user.groups),
        username: defaultState.get("username"),
        password: defaultState.get("password"),
        loginError: false
      });
    }
    case ADMIN_LOGIN_SUCCESS:
      return state.merge({
        adminLoggedIn: true
      });
    case LOGIN_ERROR:
      return state.set("loginError", true);
    case INIT_LANGUAGE:
      changeLanguage(state);
      return state;
    case SET_LANGUAGE: {
      const newState = state.set("language", action.language);
      changeLanguage(newState);
      return newState;
    }
    case ADMIN_LOGOUT_SUCCESS:
    case LOGOUT_SUCCESS:
      return defaultState.set("language", state.get("language"));
    case LOGIN_LOADING:
      return state.merge({
        loading: action.showLoading
      });
    case STORE_EMAIL:
      return state.set("email", action.email);
    default:
      return state;
  }
}
