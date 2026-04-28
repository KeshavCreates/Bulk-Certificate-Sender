# Bulk Certificate Sender

A browser-based certificate generation and bulk email delivery tool built with Node.js, Express, Fabric.js, PapaParse, jsPDF, JSZip, and Nodemailer. The application lets you choose or upload a certificate template, customize it in a visual editor, upload recipient data from CSV, and then generate and send personalized certificates in bulk.

## Overview

This project is designed for teams, colleges, communities, and event organizers who need to create certificates quickly and deliver them to many recipients without switching between separate design, export, and email tools.

The workflow is intentionally simple:

1. Choose a built-in template or upload your own background image.
2. Customize the certificate in the canvas editor.
3. Upload a CSV file containing recipient names and emails.
4. Configure SMTP settings.
5. Preview, generate, download, or send certificates in bulk.

## Key Features

- Template-based certificate creation
- Custom background image upload
- Drag-and-drop canvas editing with Fabric.js
- Text editing, font selection, size, color, and bold toggling
- Logo upload support
- Undo and redo history
- Snapping guidelines for cleaner element alignment
- CSV import with PapaParse
- Duplicate email detection and removal
- Personalized `{NAME}` replacement
- PDF generation using jsPDF
- Download all certificates as a ZIP file
- SMTP testing before sending
- Bulk email delivery with Nodemailer
- Server-sent progress updates during batch sending
- Draft save and restore using localStorage

## Built-In Templates

The app includes four programmatic certificate styles:

- Royal Blue
- Modern Minimal
- Emerald Classic
- Crimson Prestige

Each template is drawn on the Fabric.js canvas and can be edited before export.

## Tech Stack

### Frontend
- HTML, CSS, and JavaScript
- Fabric.js
- PapaParse
- jsPDF
- JSZip

### Backend
- Node.js
- Express
- Multer
- Nodemailer
- CORS

## How It Works

### 1. Template Selection
The landing page presents a set of certificate templates, each rendered into a preview card. You can also upload a custom certificate background image.

### 2. Visual Editing
The editor loads the selected template into a Fabric.js canvas. You can move elements, edit text, change typography, upload a logo, and save the current state as a draft.

### 3. CSV Import
The app accepts a CSV file with at least a `Name` column and optionally an `Email` column. Duplicate email addresses are detected and flagged, with an option to remove duplicates.

### 4. Preview and Output
The app can render a preview for the first recipient, generate all personalized PDFs, or export all certificates as a ZIP archive.

### 5. Bulk Email Sending
Before sending, the app verifies SMTP connectivity. The backend then sends certificates in a rate-limited loop with retry handling for temporary failures and progress updates streamed back to the browser.

## API Endpoints

### `POST /api/test-smtp`
Verifies that the SMTP settings are valid.

**Request body**
- `host`
- `port`
- `secure`
- `user`
- `pass`

**Response**
- `success`
- `message`

### `POST /api/send-batch`
Receives generated PDFs, recipient data, and SMTP configuration, then sends certificates in bulk using an event-stream response for live progress updates.

**Request fields**
- `pdfs[]`
- `recipients`
- `smtpHost`
- `smtpPort`
- `smtpSecure`
- `smtpUser`
- `smtpPass`
- `subject`
- `fromName`
- `emailBody`

## Project Structure

```text
.
├── server.js
├── package.json
└── public
    ├── index.html
    ├── css
    │   └── style.css
    └── js
        ├── app.js
        ├── editor.js
        ├── csv-handler.js
        ├── generator.js
        └── templates.js
```

## Installation

```bash
git clone https://github.com/KeshavCreates/Bulk-Certificate-Sender.git
cd Bulk-Certificate-Sender
npm install
```

## Run the App

```bash
npm start
```

The app starts on the configured port, or `3456` by default.

## Usage Guide

### Create certificates
1. Open the app in your browser.
2. Choose one of the certificate templates or upload your own design.
3. Customize the certificate text and logo.
4. Save a draft if needed.

### Prepare recipient data
1. Create a CSV file with a `Name` column.
2. Add an `Email` column if you want to send certificates by email.
3. Upload the CSV in Step 3 of the workflow.

### Configure email delivery
1. Enter your SMTP host, port, username, and app password.
2. Use the built-in Gmail or Outlook presets, or switch to a custom SMTP server.
3. Test the connection before sending.

### Send or download
- Preview the first certificate.
- Download all certificates as a ZIP archive.
- Send all certificates by email with live progress feedback.

## CSV Format

Minimum required columns:

```csv
Name,Email
Asha,asha@example.com
Rahul,rahul@example.com
```

If the `Email` column is missing, the app can still preview and generate certificates, but email sending requires valid addresses.

## Notes on SMTP

- Gmail uses `service: "gmail"` and supports app passwords.
- Other providers can be used with custom host, port, and secure settings.
- The backend includes retries for temporary SMTP failures and rate limiting to reduce delivery issues.

## Security and Data Handling

- The app does not rely on a separate database.
- Drafts and CSV data are stored in the browser using `localStorage`.
- Certificate generation happens locally in the browser before upload for sending.
- Uploaded PDFs are processed in memory on the server through Multer.

## Future Improvements

- Database-backed recipient management
- Saved template library
- Better validation for CSV schemas
- PDF watermarking and branding controls
- Role-based access for teams
- Delivery analytics and resend controls

## License

This project is licensed under the MIT License. See the LICENSE file for details.
