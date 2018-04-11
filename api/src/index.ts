import app from "./App";

import { provisionBlockchain } from "./provisioning";
const port = process.env.PORT || 3000;

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  provisionBlockchain();
  return console.log(`server is listening on ${port}`);
});
