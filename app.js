const dotenv = require("dotenv");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

// Allow requests from the specified origin
app.use(cors({
  origin: 'https://sports-web-app-weld.vercel.app',
  credentials: true, // If your frontend sends credentials (like cookies), set this to true
}));

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

dotenv.config({ path: "./config.env" });

require("./db/conn");


// const User = require("./models/userSchema");

app.use(express.json()); //converting data into json format and this is also a middleWare

app.use(require("./router/auth")); //this is a middleWare

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running Successfully at port " + PORT);
});
