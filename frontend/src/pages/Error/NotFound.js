import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const NotFound = () => (
  <div className="inner-container column">
    <Card className="error-card">
      <CardContent className="error-card-content">
        <h4>404 - Sorry, I couldn&apos;t find the page you requested</h4>
        <br />
        <img src="/404.gif" alt="I am sorry :(" />
      </CardContent>
    </Card>
  </div>
);

export default NotFound;
