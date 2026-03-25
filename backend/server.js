const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const registrosRoutes = require("./routes/records");
const path = require("path");
const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/registros", registrosRoutes);

app.use(express.static(path.join(__dirname, "public/build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public/build", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
