const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://proyou9999:Aeiou%40123@fruit.wibdyze.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the fruit model
const Fruit = mongoose.model('Fruit', {
  name: String,
  image: String,
  quantity: Number,
  price: Number, // Add the price field
});

const Transaction = mongoose.model('Transaction', {
date: { type: Date, default: Date.now },
  amount: Number,
  
  // Add other fields as needed
});


// Middleware to parse JSON requests
app.use(express.json());

// Routes


// Add transaction to MongoDB
app.post('/addTransaction', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Add fruit to MongoDB
app.post('/addFruit', async (req, res) => {
  try {
    const newFruit = new Fruit(req.body);
    await newFruit.save();
    res.status(201).json({ message: 'Fruit added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all fruits from MongoDB
app.get('/getFruits', async (req, res) => {
  try {
    const fruits = await Fruit.find();
    res.status(200).json(fruits);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all transactions from MongoDB
app.get('/getTransactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).limit(10); // Limit to the last 10 transactions
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Update existing fruit in MongoDB
app.put('/updateFruit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedFruit = await Fruit.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedFruit);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete fruit from MongoDB
app.delete('/deleteFruit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Fruit.findByIdAndDelete(id);
    res.status(200).json({ message: 'Fruit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
