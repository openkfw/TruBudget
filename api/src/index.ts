import app from './App'

import { injectUsers } from "./provisioning/users";
const port = process.env.PORT || 3000

app.listen(port, (err) => {
  if (err) {
    return console.log(err)
  }
  injectUsers()
  return console.log(`server is listening on ${port}`)
})
