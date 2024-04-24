import React, { useEffect } from "react";

import { userManager } from "./OidcClient";

const Callback = () => {
  useEffect(() => {
    userManager
      .signinRedirectCallback()
      .then((user) => {
        console.log(user);
        window.location = "/";
      })
      .catch((error) => {
        console.error("Problem signing in", error);
      });
  }, []);

  return <div>Signing in...</div>;
};

export default Callback;
