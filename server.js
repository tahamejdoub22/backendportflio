const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://taha:taha@cluster0.po1evxm.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Define Mongoose schema and model
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
  
const Contact = mongoose.model('Contact', ContactSchema);

// Routes
app.post('/submit', (req, res) => {
    // Form validation can be added here

    const newContact = new Contact({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    });

    newContact.save()
      .then(contact => res.json({ message: 'Form submitted successfully!' }))
      .catch(err => {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: err });
        }
        res.status(500).json({ message: 'Server error', error: err });
      });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
