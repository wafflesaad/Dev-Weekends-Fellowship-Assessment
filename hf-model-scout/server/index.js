const express = require("express");
const cors = require("cors");
const modelsRouter = require("./routes/models");

const app = express();
const port = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/models", modelsRouter);

app.listen(port, () => {
  console.log(`HF Model Scout API running on port ${port}`);
});
