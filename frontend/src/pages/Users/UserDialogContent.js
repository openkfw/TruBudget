import React from "react";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import NameIcon from "@mui/icons-material/AssignmentInd";
import InfoIcon from "@mui/icons-material/Info";
import UsernameIcon from "@mui/icons-material/Person";
import OrgaIcon from "@mui/icons-material/StoreMallDirectory";
import { Typography } from "@mui/material";

import strings from "../../localizeStrings";
import FormTextField from "../Common/FormTextField";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import UserPassword from "../Common/UserPassword";

import "./UserDialogContent.scss";

const UserDialogContent = ({
  organization,
  setDisplayName,
  setPassword,
  setConfirmPassword,
  setUsername,
  setOrganization,
  setIsUserFormValid
}) => {
  const accountnameRegex = /^([A-Za-zÀ-ÿ0-9-_ ]*)$/;
  const usernameRegex = /^([A-Za-zÀ-ÿ0-9-_]*)$/;
  const passwordRegex = /^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/;

  const initialValues = {
    accountname: "",
    username: "",
    password: "",
    confirmPassword: ""
  };

  const userSchema = Yup.object().shape({
    accountname: Yup.string()
      .required(`${strings.users.account_name_error}`)
      .min(4, `${strings.users.account_name_conditions_preface} ${strings.users.account_name_conditions_length}`)
      .matches(
        accountnameRegex,
        `${strings.users.account_name_conditions_preface} ${strings.users.account_name_conditions_forbidden}; ${strings.users.account_name_conditions_solution}`
      )
      .trim(),
    username: Yup.string()
      .required(`${strings.users.login_id_error}`)
      .min(4, `${strings.users.login_id_conditions_preface} ${strings.users.login_id_conditions_length}`)
      .matches(
        usernameRegex,
        `${strings.users.login_id_conditions_preface} ${strings.users.login_id_conditions_forbidden}; ${strings.users.login_id_conditions_solution}`
      )
      .notOneOf(["root"], strings.users.login_id_no_root)
      .trim(),
    password: Yup.string()
      .required(`${strings.users.password_error}`)
      .min(8, `${strings.users.password_conditions_preface} ${strings.users.password_conditions_length}`)
      .matches(
        passwordRegex,
        `${strings.users.password_conditions_preface} ${strings.users.password_conditions_letter}; ${strings.users.password_conditions_number}`
      )
      .trim(),
    confirmPassword: Yup.string()
      .required(`${strings.users.confirm_password_error}`)
      .oneOf([Yup.ref("password"), null], strings.users.no_password_match)
      .trim()
  });

  const handleIsFormValid = (errors, isValid) => {
    if (!errors.password && !errors.confirmPassword && !errors.username && !errors.accountname) {
      setIsUserFormValid(isValid);
    } else {
      setIsUserFormValid(isValid);
    }
  };

  return (
    <div className="user-dialog-container">
      <span className="info">
        <InfoIcon className="info-icon" />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div className="user-form">
        <Formik initialValues={initialValues} validationSchema={userSchema}>
          {({ values, errors, touched, isValid }) => (
            <Form>
              <TextInputWithIcon
                className="text-input"
                label={strings.common.organization}
                value={organization}
                data-test="organization"
                disabled={true}
                error={false}
                icon={<OrgaIcon />}
                onKeyUp={(e) => setOrganization(e.targe.value)}
              />
              <Field
                name="accountname"
                className="text-input"
                label={strings.users.account_name}
                value={values.accountname}
                icon={<NameIcon />}
                error={Boolean(errors.accountname && touched.accountname)}
                data-test="accountname"
                onKeyUp={(e) => {
                  setDisplayName(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={FormTextField}
                required
              />
              <Field
                name="username"
                label={strings.common.username}
                value={values.username}
                icon={<UsernameIcon />}
                error={Boolean(errors.username && touched.username)}
                data-test="username"
                id="username"
                onKeyUp={(e) => {
                  setUsername(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={FormTextField}
                required
              />
              <Field
                name="password"
                className="password short"
                iconDisplayed={true}
                label={strings.common.password}
                password={values.password}
                error={Boolean(errors.password && touched.password)}
                data-test="password-new-user"
                onKeyUp={(e) => {
                  setPassword(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={UserPassword}
                required
              />
              <Field
                name="confirmPassword"
                className="password short"
                iconDisplayed={true}
                label={strings.users.new_user_password_confirmation}
                password={values.confirmPassword}
                error={Boolean(errors.confirmPassword && touched.confirmPassword)}
                data-test="password-new-user-confirm"
                onKeyUp={(e) => {
                  setConfirmPassword(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={UserPassword}
                required
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
export default UserDialogContent;
