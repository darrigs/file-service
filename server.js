const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Setup storage for multer to save files locally in 'uploads' folder
const upload = multer({ dest: 'uploads/' });

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded: ${req.file.originalname}`);
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);

  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(port, () => {
  console.log(`File service running on http://localhost:${port}`);
});
