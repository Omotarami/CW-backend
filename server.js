var express = require("express");
let app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.set("json spaces", 3);
const path = require("path");

app.use("/images", express.static(path.join(__dirname, "images")));
let PropertiesReader = require("properties-reader");

let propertiesPath = path.resolve(__dirname, "db.properties");
let properties = PropertiesReader(propertiesPath);

let dbPprefix = properties.get("db.prefix");

let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;

const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

let db1;

async function connectDB() {
  try {
    client.connect();
    console.log("Connected to MongoDB");
    db1 = client.db("backend");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();
app.get("/collections/:collectionName", async function (req, res) {

})

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "An error occurred" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});