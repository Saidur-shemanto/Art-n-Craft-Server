const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sto5ven.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const userCollection = client.db('AnCDB').collection('users');
        const paintCollection = client.db('AnCDB').collection('paintings');


        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })
        app.get('/paintings', async (req, res) => {
            const cursor = paintCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/paintings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const cursor = paintCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.post('/paintings', async (req, res) => {
            const newPainting = req.body;
            const result = await paintCollection.insertOne(newPainting);
            res.send(result);
        })
        app.delete('/paintings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await paintCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/paintings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedPainting = req.body;

            const painting = {
                $set: {
                    image: updatedPainting.image,
                    itemName: updatedPainting.itemName,
                    sub: updatedPainting.sub,
                    shortDesc: updatedPainting.shortDesc,
                    price: updatedPainting.price,
                    rating: updatedPainting.rating,
                    custom: updatedPainting.custom,
                    process: updatedPainting.process,
                }
            }

            const result = await paintCollection.updateOne(filter, painting, options);
            res.send(result);
        })

        app.get('/myPaintings/:id', async (req, res) => {
            const id = req.params.id
            const query = { userId: id }
            const cursor = paintCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Coffee making server is running')
})

app.listen(port, () => {
    console.log(`Coffee Server is running on port: ${port}`)
})