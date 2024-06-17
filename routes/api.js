const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize database with seed data
router.get('/initialize', async (req, res) => {
    try {
        const { data } = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        await Transaction.insertMany(data);
        res.send('Database initialized with seed data');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// List all transactions with search and pagination
router.get('/transactions', async (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const query = {
        $or: [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { price: new RegExp(search, 'i') },
        ],
    };
    try {
        const transactions = await Transaction.find(query)
            .skip((page - 1) * perPage)
            .limit(Number(perPage));
        res.json(transactions);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Statistics API
router.get('/statistics', async (req, res) => {
    const { month } = req.query;
    try {
        const start = new Date(`${month} 1`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const totalSales = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: start, $lt: end } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' }, totalSold: { $sum: { $cond: ['$sold', 1, 0] } }, totalNotSold: { $sum: { $cond: ['$sold', 0, 1] } } } }
        ]);

        res.json(totalSales[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Bar chart data API
router.get('/barchart', async (req, res) => {
    const { month } = req.query;
    try {
        const start = new Date(`${month} 1`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity },
        ];

        const result = await Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.countDocuments({ price: { $gte: range.min, $lt: range.max }, dateOfSale: { $gte: start, $lt: end } });
            return { range: range.range, count };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Pie chart data API
router.get('/piechart', async (req, res) => {
    const { month } = req.query;
    try {
        const start = new Date(`${month} 1`);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const categories = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: start, $lt: end } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json(categories);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Combined data API
router.get('/combined', async (req, res) => {
    try {
        const [statistics, barChart, pieChart] = await Promise.all([
            axios.get('http://localhost:5000/api/statistics', { params: req.query }),
            axios.get('http://localhost:5000/api/barchart', { params: req.query }),
            axios.get('http://localhost:5000/api/piechart', { params: req.query }),
        ]);

        res.json({
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data,
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
