const express = require("express");
const agentRoutes = require("./routes/agentsRoute.js");

const newRoutes=require('./routes/new.js')
const cors = require("cors");
require("dotenv").config();
// const port = process.env.PORT || 4000

const app = express();
app.use(express.json());
app.use(cors());

app.use("/agents", agentRoutes);
app.use("/ticket",newRoutes)
app.listen(5000, async () => {
    console.log(`Server running on the port`,5000);
});