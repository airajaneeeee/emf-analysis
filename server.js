const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/emfDB";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("Error connecting to MongoDB Atlas:", err));

// Define Schema
const emfSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    emf: { type: Number, required: true },
    mf: Number,
    rf: Number,
});

const EMF = mongoose.model('EMF', emfSchema);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoints

// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const data = await EMF.find();
        res.json(data);
    } catch (err) {
        res.status(500).send("Error retrieving data");
    }
});

// Add new data
app.post('/api/data', async (req, res) => {
    try {
        const newEntry = new EMF(req.body);
        await newEntry.save();
        res.json(newEntry);
    } catch (err) {
        res.status(500).send("Error saving data");
    }
});

// Get a single data record by ID
app.get('/api/data/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await EMF.findById(id);
        if (!data) {
            return res.status(404).send('Data not found');
        }
        res.json(data);
    } catch (err) {
        console.error('Error fetching data by ID:', err);
        res.status(500).send('Error fetching data');
    }
});

// Update data by ID
app.put('/api/data/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;

        console.log('Received PUT request for ID:', id);
        console.log('Request body:', updatedData);

        const result = await EMF.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        if (!result) {
            return res.status(404).send('Data not found');
        }

        console.log('Updated data:', result);
        res.json(result);
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).send('Error updating data');
    }
});

// Catch-all route to serve index.html for any unmatched route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));