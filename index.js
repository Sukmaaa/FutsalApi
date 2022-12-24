const express = require("express");
const app = express();
const cors = require("cors");
const port = 4200;
const router = require("./src/routes");

require("dotenv").config();

app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use("/api/v1", router);

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
