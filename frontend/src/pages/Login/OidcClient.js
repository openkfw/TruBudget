import React, { useEffect, useState } from "react";
import { UserManager } from "oidc-client";

export const userManager = new UserManager({
  authority: "http://localhost:4000",
  client_id: "your-client-id",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "openid profile email"
});

const OidcClient = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userManager.getUser().then((user) => {
      if (!user || user.expired) {
        userManager.signinRedirect();
      } else {
        setUser(user);
      }
    });
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.profile.name}!</h1>
          <p>You are logged in.</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default OidcClient;
