const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create an Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace with your actual MongoDB connection string
const dbURI = 'mongodb+srv://SamehNassar:Lovesameh1@cluster0.rzezt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Create a Mongoose schema and model for Groups
const groupSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    day: String,
    time: String
});

const Group = mongoose.model('Group', groupSchema);

// Create a Mongoose schema and model for Kids
const kidSchema = new mongoose.Schema({
    name: String,
    mother: String,
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    attendanceCount: { type: Number, default: 0 }
});

const Kid = mongoose.model('Kid', kidSchema);

// Routes for Groups
// Get all groups
app.get('/api/groups', async (req, res) => {
    try {
        const groups = await Group.find();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new group
app.post('/api/groups', async (req, res) => {
    const { name, day, time } = req.body;
    try {
        const newGroup = new Group({ name, day, time });
        await newGroup.save();
        res.status(201).json(newGroup);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a group by ID
app.delete('/api/groups/:id', async (req, res) => {
    try {
        const group = await Group.findByIdAndDelete(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });
        res.json({ message: 'Group deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Routes for Kids
// Get all kids
app.get('/api/kids', async (req, res) => {
    try {
        const kids = await Kid.find().populate('group');
        res.json(kids);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new kid
app.post('/api/kids', async (req, res) => {
    const { name, mother, group } = req.body;
    try {
        const newKid = new Kid({ name, mother, group });
        await newKid.save();
        res.status(201).json(newKid);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a kid by ID
app.delete('/api/kids/:id', async (req, res) => {
    try {
        const kid = await Kid.findByIdAndDelete(req.params.id);
        if (!kid) return res.status(404).json({ error: 'Kid not found' });
        res.json({ message: 'Kid deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update attendance
app.put('/api/kids/:id/attendance', async (req, res) => {
    try {
        const kid = await Kid.findById(req.params.id);
        kid.attendanceCount += 1;
        await kid.save();
        res.json(kid);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
