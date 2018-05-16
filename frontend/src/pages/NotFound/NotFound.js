import React from "react";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

import globalStyles from "../../styles";

const NotFound = () => (
  <div style={{ ...globalStyles.innerContainer, flexDirection: "column", alignItems: "center" }}>
    <Card
      style={{
        width: "100%",
        position: "relative",
        zIndex: 1100
      }}
    >
      <CardContent
        style={{
          textAlign: "center"
        }}
      >
        <h4>404 - Sorry, I couldn't find the page you requested</h4>
        <br />
        <img src="/404.gif" alt="I am sorry :(" />
      </CardContent>
    </Card>
  </div>
);

export default NotFound;
