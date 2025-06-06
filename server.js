const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Mailjet = require('node-mailjet');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://mohamedtahamejdoub:3b0opEVv2myTMCTY@cluster0.reloxqg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Configure Mailjet with the provided API credentials
const mailjetClient = Mailjet.connect(
    'fa876ddf58272c9cd366f71e1d013c05',
    '6f1de5f1e532e21f5ead077375df2c1c'
);

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
app.post('/submit', async (req, res) => {
    // Form validation can be added here

    const newContact = new Contact({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message
    });

    try {
        await newContact.save();

        // Send notification email with Mailjet
        await mailjetClient
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: { Email: 'no-reply@example.com', Name: 'Portfolio Contact' },
                        To: [{ Email: 'mohamedtahamejdoub@gmail.com' }],
                        Subject: 'New contact request',
                        TextPart: `Name: ${newContact.name}\nEmail: ${newContact.email}\nSubject: ${newContact.subject}\nMessage: ${newContact.message}`
                    }
                ]
            });

        res.json({ message: 'Form submitted successfully!' });
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: err });
        }
        res.status(500).json({ message: 'Server error', error: err });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
