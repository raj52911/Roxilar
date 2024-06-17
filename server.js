const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());

// Define your Mongoose schema for the transaction data
const transactionSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  dateOfSale: Date,
  price: Number,
  // Add other relevant fields from the API response
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Connect to MongoDB database (replace with your connection string)
mongoose.connect('mongodb+srv://t21ada38:Mohan52911,@mern.gldgrtx.mongodb.net/mern?retryWrites=true&w=majority&appName=Mern')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Function to fetch and seed data
const seedData = async () => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Loop through each transaction and save to database
    for (const transaction of transactions) {
      const newTransaction = new Transaction({
        productId: transaction.productId,
        productName: transaction.productName,
        dateOfSale: new Date(transaction.dateOfSale), // Parse date string
        price: transaction.price,
        // Add other fields as needed
      });
      await newTransaction.save();
    }
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error fetching or seeding data:', error);
  }
};

// API endpoint to fetch transactions by month
app.get('/transactions/:month', async (req, res) => {
  const month = req.params.month;

  // Check for valid month
  if (!['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
    return res.status(400).json({ message: 'Invalid month provided' });
  }

  try {
    const transactions = await Transaction.find({
      dateOfSale: {
        $month: new Date().getMonth() + 1, // Get current month (January = 1)
        $year: new Date().getFullYear(), // Ignore year for filtering
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/info', (req, res) => {
  res.send('Welcome to the MERN backend server!');
});

// Call seedData function on startup (comment out after initial seeding)
// seedData();

app.listen(port, () => console.log(`Server listening on port ${port}`));
