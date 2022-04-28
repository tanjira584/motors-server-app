const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.3jhfr.mongodb.net/motorStore?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
        await client.connect();
        const motorDelar = client.db("motorStore").collection("motor");
    } finally {
    }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
    res.send("Hello , This is home route of server");
});
app.listen(port, () => {
    console.log("Server running successfully");
});
