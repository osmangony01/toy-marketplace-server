
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("toys server is running ...");
})


app.listen(PORT, () => {
    console.log('Toys server is running on PORT: ', PORT);
})