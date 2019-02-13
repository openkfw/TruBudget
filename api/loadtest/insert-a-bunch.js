const axios = require("axios");

const host = "localhost";
const port = 8080;
const prefix = "/api";

const base = `http://${host}:${port}${prefix}`;

const run = async () => {
  const token = await axios
    .post(`${base}/user.authenticate`, {
      apiVersion: "1.0",
      data: {
        user: {
          id: "mstein",
          password: "test",
        },
      },
    })
    .then(r => r.data.data.user.token)
    .catch(err => console.error("Error logging in", err));

  console.log(`Received token: ${token}`);

  let postFix = 4001;
  const projects = Array.from({
      length: 1000
    },
    () => `autoproject${++postFix}`,
  );

  for (name of projects) {
    await axios
      .post(
        `${base}/global.createProject`, {
          apiVersion: "1.0",
          data: {
            project: {
              id: name,
              displayName: "dummy",
              description: "dummy",
              amount: "1",
              assignee: "mstein",
              currency: "EUR",
              thumbnail: "",
            },
          },
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      .then(() => console.log(`Create project ${name}`))
      .catch(err => {
        console.error("Error creating project:", err);
        process.exit(1);
      });
  }
};

run();
