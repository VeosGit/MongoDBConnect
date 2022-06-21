const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.eo2wg.mongodb.net/playerData?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function() {
  console.log("Connection To MongoDB Atlas Successful!");
});

require("./models/player");
const playerModel = mongoose.model("Player");

const bodyParser = require("body-parser");

app.use((req, res, next) => {

  // authentication middleware

  const auth = {login: 'someusername', password: 'somepassword'} // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied lol...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this if you want to be a 
  res.status(401).send('Authentication required.') // custom message

})

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());

app.get("/", (request, response) => {
  response.send("Hi, This Is A Tutorial Api . . .");
});

app.get("/player-data/:id", async (request, response) => {
  async function playerDataCheck() {
    const playerData = await playerModel.findOne({
      userID: `${request.params.id}`
    });

    if (playerData) {
      return playerData;
    } else {
      const newPlayerDataInstance = new playerModel({
        userID: `${request.params.id}`,
        coins: 0
      });

      const newPlayerData = await newPlayerDataInstance.save();

      return newPlayerData;
    }
  }

  response.json(await playerDataCheck());
});

app.post("/player-data/update-coins/:id", async (request, response) => {
  await playerModel.findOneAndUpdate(
    { userID: `${request.params.id}` },
    { $set: { coins: request.body.coins } }
  );
  response.send("Updated Database.");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
