const express = require("express");
const path = require("path");
const cors = require("cors");
const { connectDB } = require("./db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const corsOptions = {
  origin: "http://xjllao.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

connectDB();
app.use(express.static(path.join(__dirname, 'client/public')));

app.use("/api", authRoutes);

app.use("/pdf", express.static(path.join(__dirname, "client/public/pdf")));


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/public/index.html"));
});

app.get("/", (req, res) => {
  res.send("Hello from Server!");
});

const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 30;

app.listen(PORT, () => {
  console.log(`Server running on all network interfaces: ${PORT}`);
});
