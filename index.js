
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("toys server is running ...");
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l6kpz6n.mongodb.net/?retryWrites=true&w=majority`;

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
    // Send a ping to confirm a successful connection


    const toyCategory = client.db("marketplaceToy").collection("toyCategory");
    const toySubCategory = client.db("marketplaceToy").collection("toySubCategory");
    const toyCollection = client.db("marketplaceToy").collection("toys");


    app.get("/toyCategory", async (req, res) => {
      const result = await toyCategory.find().toArray();
      res.send(result);
    })

    app.get("/toySubCategory", async (req, res) => {
      const result = await toySubCategory.find().toArray();
      res.send(result);
    })

    // find sub category of specific category
    app.get("/toySubCategory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { categoryId: id }
      const result = await toySubCategory.find(query).toArray();
      res.send(result);
    })

    // // crate a toy
    app.post("/addtoy", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toyCollection.insertOne(toy);
      res.send(result);
    })

    // get all toy
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    })

    // find a subcategory
    app.get("/subCategory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { subCategoryId: id }
      const result = await toySubCategory.findOne(query);
      res.send(result);
    })

    // find a toy
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result);
    })

    // find some toy using subCategoryId
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { subCategoryId: id }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    })



    // find a user toys
    app.get("/mytoy", async (req, res) => {
      // console.log(req.headers.authorization);
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await toyCollection.find(query).toArray()
      res.send(result);
    })

    // update a toy
    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const updateToy = req.body;
      console.log(id);
      console.log(updateToy);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toy = {
        $set: {
          categoryId: updateToy.categoryId,
          subCategoryId: updateToy.subCategoryId,
          toyName: updateToy.toyName,
          price: updateToy.price,
          rating: updateToy.rating,
          quantity: updateToy.quantity,
          photoURL: updateToy.photoURL,
          sellerName: updateToy.sellerName,
          sellerEmail: updateToy.sellerEmail,
          details: updateToy.details,
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })

    

    // delete a toy
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // c Sort by price in ascending order
    app.get('/toyToPrice', async (req, res) => {

      //const sortedToys = await toyCollection.find().sort({ price: 1 }).collation({ locale: 'en_US', numericOrdering: true }).toArray(); 
      const sortedToys = await toyCollection.aggregate([
        {
          $match: {
            sellerEmail: req.query.email // Filter by the specific product ID
          }
        },
        {
          $addFields: {
            convertedPrice: {
              $convert: {
                input: "$price",
                to: "double",
                onError: 0,
                onNull: 0
              }
            }
          }
        },
        {
          $sort: {
            convertedPrice: 1
          }
        },
        {
          $unset: "convertedPrice"
        }
      ]).toArray();
      res.json(sortedToys);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(PORT, () => {
  console.log('Toys server is running on PORT: ', PORT);
})