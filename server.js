const express = require("express");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql");
const { verifyToken } = require("./middleware");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

const app = express();
const port = 3500;

// Creating HTTPS Server
const privateKey = fs.readFileSync("ssl/private-key.pem", "utf8");
const certificate = fs.readFileSync("ssl/certificate.pem", "utf8");
const ca = fs.readFileSync("ssl/csr.pem", "utf8");

const credentials = { key: privateKey, cert: certificate, ca: ca };

var databaseOptions = require("dotenv").config();
var db = mysql.createConnection(databaseOptions);

app.use(express.json());
app.use(bodyParser.json());

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = { username };

  let sql =
    "SELECT * FROM flipkartcustomerdb.customer WHERE username = ? && password = ?";

  db.query(sql, [username, password], (error, data) => {
    if (error) return res.status(500).send(error);
  });
  const token = jwt.sign(user, secretKey, { expiresIn: "1m" });

  res.json({ token });
});

app.get("/", verifyToken, (req, res) => {
  res.send("Flipkart customer service");
});

app.get("/customers", verifyToken, (req, res) => {
  let sql = "SELECT * FROM flipkartcustomerdb.customer";
  db.query(sql, (error, data) => {
    if (error) return res.status(500).send(error);

    data.forEach((customer) => {
      customer.password = "********";
    });

    res.status(200).send(data);
  });
});

app.put("/customers", verifyToken, (req, res) => {
  const id = req.body.id;
  const customer = req.body;

  let sql = "UPDATE flipkartcustomerdb.customer SET ? WHERE id = ?";
  db.query(sql, [customer, id], (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(201).send(customer);
  });
});

app.post("/customers", verifyToken, (req, res) => {
  const customer = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    mobile: req.body.mobile,
    email: req.body.email,
    address: req.body.address,
    pincode: req.body.pincode,
    username: req.body.firstname + req.body.lastname,
    password: "qwertyuiop",
  };

  let sql = "INSERT INTO flipkartcustomerdb.customer SET ?";
  db.query(sql, customer, (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(201).send(customer);
  });
});

app.delete("/customers/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  console.log(id);

  let sql = "DELETE FROM flipkartcustomerdb.customer WHERE id = ?";
  db.query(sql, id, (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(200).send(`customer od ${id} is deleted`);
  });
});

const server = https.createServer(credentials, app);
server.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
