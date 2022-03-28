import * as express from "express";

const app = express();

// Environmental variables

const PORT = parseInt(process.env.PORT || "8081", 10);

// Routes
app.get("/", (req, res) => {
  res.send("OK lets go");
});

app.listen(PORT, () =>
  console.log(`Blockchain-Explorer running  on Port ${PORT} ...`)
);
