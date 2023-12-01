const express = require("express");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql");
const { verifyAPIKey } = require("./middleware");

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

app.get("/", verifyAPIKey, (req, res) => {
  res.send("Flipkart customer service");
});

app.get("/customers", verifyAPIKey, (req, res) => {
  let sql = "select * from flipkartcustomerdb.customer";
  db.query(sql, (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(200).send(data);
  });
});

app.put("/customers", verifyAPIKey, (req, res) => {
  const id = req.params.id;
  const customer = req.body;

  let sql = "UPDATE flipkartcustomerdb.customer SET ? WHERE id = ?";
  db.query(sql, [customer, id], (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(201).send(customer);
  });
});

app.post("/customers", verifyAPIKey, (req, res) => {
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

  // Check for required fields
  const requiredFields = [
    "firstname",
    "lastname",
    "mobile",
    "email",
    "address",
    "pincode",
  ];
  const missingFields = requiredFields.filter((field) => !customer[field]);

  if (missingFields.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing required fields: ${missingFields.join(", ")}` });
  }

  let sql = "INSERT INTO flipkartcustomerdb.customer SET ?";
  db.query(sql, customer, (error, data) => {
    if (error) return res.status(500).send(error);
    res.status(201).send(customer);
  });
});

app.delete("/customers/:id", verifyAPIKey, (req, res) => {
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
