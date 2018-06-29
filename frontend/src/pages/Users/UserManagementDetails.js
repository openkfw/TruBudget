import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import FavoriteIcon from "@material-ui/icons/Favorite";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";

import strings from "../../localizeStrings";
const styles = {
  container: {
    marginTop: 70,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  card: {
    width: "45%",
    height: 250
  },
  cardDiv: {
    width: "100%",
    height: 150,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    width: 100,
    height: 100
  },
  headerText: {
    paddingRight: 0
  },
  headerFont: {
    fontSize: "25px"
  }
};

const UserManagementDetails = () => (
  <div style={styles.container}>
    <Card style={styles.card}>
      <CardHeader title={strings.adminDashboard.new_user} />
      <CardContent />
      <CardActions>
        <Button variant="contained" color="primary">
          {strings.common.create}
        </Button>
      </CardActions>
    </Card>
    <Card style={styles.card}>
      <CardHeader title={strings.adminDashboard.new_user} />
      <div style={styles.cardDiv}>
        <OrgaIcon style={styles.icon} />
      </div>
    </Card>
  </div>
);
export default UserManagementDetails;
