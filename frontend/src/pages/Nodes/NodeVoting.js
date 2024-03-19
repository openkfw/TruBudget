import React from "react";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from "yup";

import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";

import { ExistingNodesEmptyState, NewOrganizationsEmptyState } from "./NodesEmptyStates";

const styles = {
  cardRow: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  nodeCard: {
    width: "40%",
    paddingBottom: "20px"
  },
  card: {
    width: "48%",
    paddingBottom: "20px"
  },
  cardDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-around"
  },
  listItem: {
    display: "flex",
    flexDirection: "column"
  },
  formContainer: {
    display: "flex",
    justifyContent: "space-around"
  },
  cardList: {
    display: "flex",
    flexDirection: "column"
  },
  rightIcon: {
    marginLeft: (theme) => theme.spacing(1)
  },
  leftIcon: {
    marginRight: (theme) => theme.spacing(1)
  },
  button: {
    margin: (theme) => theme.spacing(1)
  },
  textInput: {
    width: "40%"
  }
};

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
      <div key={node.address.address}>
        <ListItem key={node.address.address}>
          <ListItemText
            primary={
              <div style={styles.listItem}>
                <Typography variant="subtitle1"> {node.address.organization}</Typography>
              </div>
            }
            secondary={
              <Typography component={"span"} variant="body2" style={styles.listItem}>
                <Typography variant="body2" display="block" component={"span"}>
                  {`${strings.nodesDashboard.address}: ${node.address.address} `}
                </Typography>
                <Typography variant="body2" display="block" component={"span"}>
                  {getDeclinersString(node.currentAccess.decliners)}
                </Typography>
              </Typography>
            }
          />
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            style={styles.button}
            onClick={() => approveNode(node.address)}
          >
            {strings.nodesDashboard.approve}
          </Button>
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            style={styles.button}
            onClick={() => declineNode(node.address)}
          >
            {strings.nodesDashboard.decline}
          </Button>
        </ListItem>
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
    alert(JSON.stringify(values, null, 2));
    registerNewOrganization(organization, nodeAddress);
    actions.resetForm();
  };

  return (
    <div style={styles.cardList}>
      <div style={styles.cardRow} data-test="node-voting">
        <Card style={styles.card}>
          <CardHeader title={strings.nodesDashboard.new_organization} />
          {isDataLoading ? (
            <div />
          ) : (
            <CardContent style={styles.cardContent}>
              <>{newOrgaNodes.length ? newOrgaNodesListEntries : <NewOrganizationsEmptyState />}</>
            </CardContent>
          )}
        </Card>
        <Card style={styles.card}>
          <CardHeader title={strings.nodesDashboard.additional_organization_node} />
          {isDataLoading ? (
            <div />
          ) : (
            <CardContent style={styles.cardContent}>
              <>{existingOrgaNodes.length ? existingOrgaNodesListEntries : <ExistingNodesEmptyState />}</>
            </CardContent>
          )}
        </Card>
      </div>
      <Card style={{ marginTop: "30px" }}>
        <CardHeader title={strings.nodesDashboard.add_organization} />
        <CardContent>
          <Formik initialValues={initialValues} validationSchema={orgValidationSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, isValid, handleChange, handleBlur }) => (
              <Form style={styles.formContainer}>
                <TextField
                  style={styles.textInput}
                  name="organization"
                  label={strings.common.organization}
                  value={values.organization}
                  error={Boolean(errors.organization) && touched.organization}
                  helperText={
                    <ErrorMessage name="organization">
                      {(msg) => <span style={{ color: "red" }}>{msg}</span>}
                    </ErrorMessage>
                  }
                  data-test="organization"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <TextField
                  style={styles.textInput}
                  name="nodeAddress"
                  label={strings.nodesDashboard.node_address}
                  value={values.nodeAddress}
                  error={Boolean(errors.nodeAddress) && touched.nodeAddress}
                  helperText={
                    <ErrorMessage name="nodeAddress">
                      {(msg) => <span style={{ color: "red" }}>{msg}</span>}
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
