require("dotenv").config();

function verifyAPIKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res
      .status(403)
      .send("Kindly provide the x-api-key to return the api!");
  }

  if (apiKey !== process.env.X_API_KEY)
    return res.status(401).send("Invalid x-api-key");

  next();
}

module.exports = {
  verifyAPIKey,
};
