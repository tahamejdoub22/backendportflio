const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const Mailjet = require('node-mailjet');


const app = express();

// Configure and enable CORS to allow requests from any origin
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

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

// Utility to generate a nicely formatted HTML email for contact requests
function createEmailHTML(contact) {
    return `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; padding:20px;">
            <div style="background:#f4f4f4; padding:10px 0; text-align:center; margin-bottom:20px;">
                <h2 style="margin:0; color:#333;">New Contact Request</h2>
            </div>
            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Name:</strong></td>
                    <td style="padding:8px; border-bottom:1px solid #eee;">${contact.name}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Email:</strong></td>
                    <td style="padding:8px; border-bottom:1px solid #eee;">${contact.email}</td>
                </tr>
                <tr>
                    <td style="padding:8px; border-bottom:1px solid #eee;"><strong>Subject:</strong></td>
                    <td style="padding:8px; border-bottom:1px solid #eee;">${contact.subject}</td>
                </tr>
                <tr>
                    <td style="padding:8px; vertical-align:top;"><strong>Message:</strong></td>
                    <td style="padding:8px;">${contact.message}</td>
                </tr>
            </table>

        </div>`;
}

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
                        // Use a configurable verified sender address; set user's email as reply-to
                        From: {
                            Email: process.env.MAIL_FROM || 'mohamedtahamejdoub@gmail.com',
                            Name: 'Portfolio Contact'
                        },
                        ReplyTo: { Email: newContact.email, Name: newContact.name },
                        // Always send the message to the portfolio owner's inbox
                        To: [{ Email: process.env.MAIL_TO || 'mohamedtahamejdoub@gmail.com' }],
                        Subject: 'New contact request',
                        TextPart: `Name: ${newContact.name}\nEmail: ${newContact.email}\nSubject: ${newContact.subject}\nMessage: ${newContact.message}`,
                        // Use a styled HTML email template for better readability
                        HTMLPart: createEmailHTML(newContact)
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
