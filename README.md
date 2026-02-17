# Backend Portfolio

This project is a simple Express server with a contact endpoint. It uses Mailjet to send an email for each submission.

## Environment Variables

- `MAIL_FROM` – Verified sender address used for outgoing emails. Default is `mohamedtahamejdoub@gmail.com`.
- `MAIL_TO` – Destination address for contact form notifications. Default is `mohamedtahamejdoub@gmail.com`.
- `PORT` – Port for the server (defaults to `3000`).

Running `npm test` executes a basic sanity test.
