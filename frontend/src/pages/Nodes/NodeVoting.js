import React from "react";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from "yup";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";

import { ExistingNodesEmptyState, NewOrganizationsEmptyState } from "./NodesEmptyStates";

import "./NodeVoting.scss";

const splitNodes = (nodes) => {
  /*
   * The reduce function returns a two dimensional array,
   * which contains the user's own node, all nodes of new organizations
   * and all nodes of existing organizations.
   */
  return nodes.reduce(
    ([self, newOrgaNodes, existingOrgaNodes], node) => {
      const isOwnNode = node.currentAccess.accessType !== "none";
      if (isOwnNode) {
        return [[...self, node], newOrgaNodes, existingOrgaNodes];
      } else {
        const organizationExists = nodes.find(
          (existingNode) =>
            existingNode.address.organization === node.address.organization &&
            existingNode.address.address !== node.address.address &&
            existingNode.currentAccess.accessType !== "none"
        );

        if (!organizationExists) {
          return [self, [...newOrgaNodes, node], existingOrgaNodes];
        } else {
          return [self, newOrgaNodes, [...existingOrgaNodes, node]];
        }
      }
    },
    [[], [], []]
  );
};

const filterDeclinedNodes = (nodes, organization) => {
  return nodes.filter((node) => {
    if (node.currentAccess.decliners.length > 0) {
      return node.currentAccess.decliners.forEach((declinerObject) => {
        return declinerObject.organization !== organization;
      });
    } else return true;
  });
};

const getDeclinersString = (decliners) => {
  let resultString = "";
  let stringArray = [];
  if (decliners.length > 0) {
    decliners.forEach((declinerObject) => {
      stringArray.push(declinerObject.organization);
    });
    resultString = `\n ${strings.nodesDashboard.declined_by}: ${stringArray.join(", ")}`;
  }
  return resultString;
};

const getListEntries = (nodes, canApprove, declineNode, approveNode) => {
  return nodes.map((node) => {
    return (
      <div className="org-list-entries" key={node.address.address}>
        <div className="org-info">
          <Typography variant="subtitle1"> {node.address.organization}</Typography>
          <Typography component={"span"} variant="body2">
            <Typography variant="body2" display="block" component={"span"} className="wrap-content">
              {`${strings.nodesDashboard.address}: ${node.address.address} `}
            </Typography>
            <Typography variant="body2" display="block" component={"span"}>
              {getDeclinersString(node.currentAccess.decliners)}
            </Typography>
          </Typography>
        </div>
        <div className="org-button-group">
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="success"
            className="org-button"
            onClick={() => approveNode(node.address)}
          >
            {strings.nodesDashboard.approve}
          </Button>
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="secondary"
            className="org-button"
            onClick={() => declineNode(node.address)}
          >
            {strings.nodesDashboard.decline}
          </Button>
        </div>
        <Divider />
      </div>
    );
  });
};

const NodeVoting = ({
  nodes,
  approveNewNodeForExistingOrganization,
  approveNewOrganization,
  allowedIntents,
  isDataLoading,
  organization,
  declineNode,
  registerNewOrganization
}) => {
  const canApprove = canApproveNode(allowedIntents);
  const visibleNodes = filterDeclinedNodes(nodes, organization);

  const [, newOrgaNodes, existingOrgaNodes] = splitNodes(visibleNodes);

  const newOrgaNodesListEntries = getListEntries(newOrgaNodes, canApprove, declineNode, ({ organization }) =>
    approveNewOrganization(organization)
  );
  const existingOrgaNodesListEntries = getListEntries(existingOrgaNodes, canApprove, declineNode, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );

  const initialValues = {
    organization: "",
    nodeAddress: ""
  };

  const orgValidationSchema = Yup.object().shape({
    organization: Yup.string().required(`${strings.nodesDashboard.organization_error}`),
    nodeAddress: Yup.string().required(`${strings.nodesDashboard.node_address_error}`)
  });

  const handleSubmit = (values, actions) => {
    const { organization, nodeAddress } = values;
    registerNewOrganization(organization, nodeAddress);
    actions.resetForm();
  };

  return (
    <div className="nodes-card-list">
      <div className="nodes-voting-cards" data-test="node-voting">
        <Card className="node-voting-card">
          <CardHeader title={strings.nodesDashboard.new_organization} />
          {isDataLoading ? (
            <div />
          ) : (
            <CardContent className="node-voting-card-content">
              <>{newOrgaNodes.length ? newOrgaNodesListEntries : <NewOrganizationsEmptyState />}</>
            </CardContent>
          )}
        </Card>
        <Card className="node-voting-card">
          <CardHeader title={strings.nodesDashboard.additional_organization_node} />
          {isDataLoading ? (
            <div />
          ) : (
            <CardContent className="node-voting-card-content">
              <>{existingOrgaNodes.length ? existingOrgaNodesListEntries : <ExistingNodesEmptyState />}</>
            </CardContent>
          )}
        </Card>
      </div>
      <Card className="new-organization-card">
        <CardHeader title={strings.nodesDashboard.add_organization} />
        <CardContent>
          <Formik initialValues={initialValues} validationSchema={orgValidationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, isValid, handleChange, handleBlur }) => (
              <Form className="new-organization-form">
                <TextField
                  className="org-text-input"
                  name="organization"
                  label={strings.common.organization}
                  value={values.organization}
                  error={Boolean(errors.organization) && touched.organization}
                  helperText={
                    <ErrorMessage name="organization">
                      {(msg) => <span className="error-message">{msg}</span>}
                    </ErrorMessage>
                  }
                  data-test="organization"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextField
                  className="org-text-input"
                  name="nodeAddress"
                  label={strings.nodesDashboard.node_address}
                  value={values.nodeAddress}
                  error={Boolean(errors.nodeAddress) && touched.nodeAddress}
                  helperText={
                    <ErrorMessage name="nodeAddress">
                      {(msg) => <span className="error-message">{msg}</span>}
                    </ErrorMessage>
                  }
                  data-test="node-address"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Button type="submit" disabled={!isValid}>
                  {strings.common.submit}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeVoting;
