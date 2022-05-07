const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
const jwt = require("jsonwebtoken");

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
        app.get("/motors", async (req, res) => {
            const query = {};
            const cursor = motorDelar.find(query);
            const motors = await cursor.toArray();
            res.send(motors);
        });
        app.post("/motors", async (req, res) => {
            const newMotor = req.body;
            const result = await motorDelar.insertOne(newMotor);
            res.send(result);
        });
        app.get("/motor/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await motorDelar.findOne(query);
            res.send(result);
        });
        app.delete("/motor/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await motorDelar.deleteOne(query);
            res.send(result);
        });
        app.put("/motor/:id", async (req, res) => {
            const id = req.params.id;
            const { qty } = req.body;
            const { delivered } = req.headers;
            const query = { _id: ObjectId(id) };
            const motor = await motorDelar.findOne(query);
            const preQty = parseInt(motor.stock);
            const updQty = delivered ? preQty - 1 : qty;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateMotor = {
                $set: {
                    stock: updQty,
                },
            };
            const result = await motorDelar.updateOne(
                filter,
                updateMotor,
                options
            );
            res.send(result);
        });
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "1d",
            });
            res.send({ accessToken });
        });
        app.get("/my-items", verifyJwt, async (req, res) => {
            const decodeEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodeEmail) {
                const query = { dEmail: email };
                const cursor = motorDelar.find(query);
                const motors = await cursor.toArray();
                res.send(motors);
            } else {
                res.status(403).send({ message: "Forbiden Access" });
            }
        });
    } finally {
    }
}
run().catch(console.dir);

function verifyJwt(req, res, next) {
    const bearToken = req.headers.authorization;
    if (!bearToken) {
        return res.status(401).send({ message: "Unauthorize access" });
    }
    const token = bearToken.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbiden Access" });
        }
        req.decoded = decoded;
        next();
    });
}

app.get("/", async (req, res) => {
    res.send("Hello , This is home route of server");
});
app.listen(port, () => {
    console.log("Server running successfully");
});
