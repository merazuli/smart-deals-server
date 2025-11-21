const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 3000;
// console.log(process.env)

// middleware 
app.use(cors());
app.use(express.json());

// uri 

// const uri = "mongodb+srv://smartdbUser:4FFwxApD1qL9GFJH@cluster0.gzvuhez.mongodb.net/?appName=Cluster0";


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gzvuhez.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('smart server is running')
})


async function run() {
    try {
        await client.connect();

        const db = client.db('smart_db');
        const productsCollection = db.collection('products');
        const bidsCollection = db.collection('bids');
        const usersCollection = db.collection('users');


        // users api related 

        app.post('/users', async (req, res) => {
            const newUser = req.body;

            // duplicate na korar jonno 
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'user already Exists.do not need to insert again' })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }


        })
        // get all data 
        app.get('/products', async (req, res) => {
            // // show kichu items 
            // const projectFields = {
            //     title: 1,
            //     price_min: 1,
            //     price_max: 1,
            //     image: 1,
            // }
            // const cursor = productsCollection.find().sort({ price_min: 1 }).skip(2).limit(2).project(projectFields);

            console.log(req.query)

            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }

            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)


        })

        // latest products get 
        app.get('/latest-products', async (req, res) => {
            const cursor = productsCollection.find().sort({ created_at: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // get single data 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: (id) }
            const result = await productsCollection.findOne(query);
            res.send(result)
        })






        // post data on mongodb 
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        // update data 

        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const query = { _id: new ObjectId(id) }

            const update = {
                $set: {
                    name: updateProduct.name,
                    price: updateProduct.price
                }
            }
            const result = await productsCollection.updateOne(query, update);
            res.send(result)

        })

        // delete data 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result);

        })



        // bids related api 
        // get data email or full data 
        app.get('/bids', async (req, res) => {
            const email = req.query.email;
            const query = {};

            if (email) {
                query.buyer_email = email;

            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })
        // product er upore koita bids porche seta ber korbo 
        app.get('/products/bids/:productId', async (req, res) => {
            const productId = req.params.productId;
            const query = { product: productId }
            const cursor = bidsCollection.find(query).sort({ bid_price: -1 })
            const result = await cursor.toArray();
            res.send(result)
        })

        // email diye bids ber korte hobe my bids 
        app.get('/bids', async (req, res) => {

            const query = {};
            if (query.email) {
                query.buyer_email = email;
            }
            const cursor = bidsCollection.find(query);
            const result = await cursor.toArray();
            req.send(result)
        })



        // post data 
        app.post('/bids', async (req, res) => {
            const newBid = req.body;
            const result = await bidsCollection.insertOne(newBid);
            res.send(result)
        })

        // delete bids 
        app.delete('/bids/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bidsCollection.deleteOne(query);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }

    finally {

    }
}



run().catch(console.dir)

app.listen(port, () => {
    console.log(`smart server is running on port :${port}`)
})