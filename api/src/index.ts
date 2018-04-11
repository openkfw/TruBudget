import app from "./App";

import { provisionBlockchain } from "./provisioning";
const port = process.env.PORT || 3000;

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }

  provisionBlockchain().catch(err => console.log(`Provisioning the chain failed: ${err}`));
  return console.log(`server is listening on ${port}`);
});
