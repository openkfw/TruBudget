import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const NotAuthorized = () => (
  <div className="inner-container column">
    <Card className="error-card">
      <CardContent className="error-content">
        <h4>401 - Sorry, you are not authorized to view this page</h4>
        <br />
        <img src="/404.gif" alt="I am sorry :(" />
      </CardContent>
    </Card>
  </div>
);

export default NotAuthorized;
