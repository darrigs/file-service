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
  res.send(`File uploaded: ${req.file.filename}`);
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

// Preview endpoint for multiple files
// GET /preview?files=abc123,def456
app.get('/preview', async (req, res) => {
  let files = req.query.files;
  if (!files) {
    return res.status(400).send('No files specified.');
  }

  if (typeof files === 'string') {
    files = files.split(',');
  }

  const previews = await Promise.all(files.map(async (filename) => {
    const filepath = path.join(uploadDir, filename);
    if (!fs.existsSync(filepath)) {
      return { filename, error: 'File not found' };
    }

    // Get file stats
    const stats = fs.statSync(filepath);
    const ext = path.extname(filename).toLowerCase();

    // For image files, return a URL to serve the image
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext)) {
      // Construct a URL for client to fetch the image preview
      return {
        filename,
        type: 'image',
        size: stats.size,
        lastModified: stats.mtime,
        url: `/preview/image/${filename}`,
      };
    }

    // For text files, return a snippet of content (first 500 chars)
    if (['.txt', '.md', '.json', '.js', '.css', '.html'].includes(ext)) {
      try {
        const content = await fs.promises.readFile(filepath, 'utf8');
        return {
          filename,
          type: 'text',
          size: stats.size,
          lastModified: stats.mtime,
          snippet: content.substring(0, 500),
        };
      } catch (err) {
        return { filename, error: 'Error reading file content' };
      }
    }

    // For other files, just return metadata
    return {
      filename,
      type: 'other',
      size: stats.size,
      lastModified: stats.mtime,
      message: 'Preview not available for this file type',
    };
  }));

  res.json(previews);
});

// Serve image files for preview
app.get('/preview/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(uploadDir, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File not found');
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
  };

  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  res.type(mimeType);
  fs.createReadStream(filepath).pipe(res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`File service running on http://localhost:${port}`);
});
