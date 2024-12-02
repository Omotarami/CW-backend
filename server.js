var express = require("express");
let app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.set("json spaces", 3);
const path = require("path");
let PropertiesReader = require("properties-reader");
// Load properties from the file
let propertiesPath = path.resolve(__dirname, "./dbconnection.properties");
let properties = PropertiesReader(propertiesPath);

// Extract values from the properties file
const dbPrefix = properties.get("db.prefix");
const dbHost = properties.get("db.host");
const dbName = properties.get("db.name");
const dbUser = properties.get("db.user");
const dbPassword = properties.get("db.password");
const dbParams = properties.get("db.params");

const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const {error} = require("console");
// MongoDB connection URL
const uri = `${dbPrefix}${dbUser}:${dbPassword}${dbHost}${dbParams}`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {serverApi: ServerApiVersion.v1});

let db1; //declare variable

async function connectDB() {
  try {
    client.connect();
    console.log("Connected to MongoDB");
    db1 = client.db("backend");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB(); //call the connectDB function to connect to MongoDB database

app.use("/images", express.static(path.join(__dirname, "images")));


//Optional if you want the get the collection name from the Fetch API in test3.html then
app.param("collectionName", async function (req, res, next, collectionName) {
  req.collection = db1.collection(collectionName);
  console.log("Middleware set collection:", req.collection.collectionName);
  next();
});

app.get("/collections/:collectionName", async function (req, res, next) {
  try {
    const lessons = await req.collection.find({}).toArray();

    console.log("Retrieved data", lessons);

    res.json(lessons);
  } catch (err) {
    console.error("Error fetching docs", err.message);
    next(err);
  }
});




app.post("/collections/:collectionName", async function (req, res) {
  try {
    const result = await req.collection.insertOne(req.body);
    res
      .status(201)
      .json({ message: "Document added", insertedId: result.insertedId });
  } catch (err) {
    console.error("Error inserting document:", err);
    res.status(500).json({ error: "Unable to insert document" });
  }
});


app.put("/collections/:collectionName/:id", async function (req, res) {
  try {
    const id = new ObjectId(req.params.id);
    const updateResult = await req.collection.updateOne(
      { _id: id },
      { $set: req.body }
    );
    if (updateResult.matchedCount === 0) {
      return res.statush(404).json({ error: "Document not found" });
    }
    res.json({
      message: "Document updated",
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (err) {
    console.error("Error updating document:", err);
    res.status(500).json({ error: "Unable to update document" });
  }
});
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({error: "An error occurred"});
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
