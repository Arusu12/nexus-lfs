const { isImage, getIcon } = require('./utils');
const config = require('./config.json');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || '';
    cb(null, path.join(config.dir, folder));
  },
  filename: (req, file, cb) => {
    const uploadFolder = config.dir
    const originalname = file.originalname;

    const filePath = path.join(uploadFolder, originalname);

    if (fs.existsSync(filePath)) {
      let count = 1;
      let newFilename;
      do {
        newFilename = `${path.parse(originalname).name} (${count})${path.extname(originalname)}`;
        count++;
      } while (fs.existsSync(path.join(uploadFolder, newFilename)));

      cb(null, newFilename);
    } else {
      cb(null, originalname);
    }
  },
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(config.dir));
app.use('/icons', express.static(path.join(__dirname, 'icons')));

app.get('/', (req, res) => {
  const configFileData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8');
  const configData = JSON.parse(configFileData);

  res.render('index', {config:configData});
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.array('file', 25), (req, res) => {
  res.redirect('/files');
});

app.get('/files', (req, res) => {
  const uploadFolder = config.dir;

  const query = req.query.q

  if (query) {
    fs.readdir(uploadFolder, (err, files) => {
      if (err) {
        return res.status(500).send('Error reading files');
      }
      const lowercaseQuery = query.toLowerCase();
      const qfiles = files.filter(file => file.toLowerCase().includes(lowercaseQuery));
      res.render('files', { query, files: qfiles, isImage, getIcon });
    });
  }else{
    fs.readdir(uploadFolder, (err, files) => {
      if (err) {
        console.error('Error reading files:', err);
        return res.status(500).send('Error reading files');
      }
      res.render('files', { query:'', files, isImage, getIcon });
    });
  }
});


app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = config.dir + filename;

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

app.post('/config', (req, res) => {

  const configFileData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8');
  const configData = JSON.parse(configFileData);

  const {dir} = req.body
  configData.dir = `${dir.replace(/\\/g, '/')}`;
  if (!configData.dir.endsWith('/')) {
    configData.dir += '/';
  }

  const updatedJsonString = JSON.stringify(configData, null, 2);
  fs.writeFileSync('config.json', updatedJsonString, 'utf-8');

  res.json({message:"Restart for changes to take effect!"})
});


function createServer() {
  app.listen(port, () => {
    const ipAddress = require('ip').address();

    const configFileData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8');
    const configData = JSON.parse(configFileData);
    configData.host = `http://${ipAddress}:${port}`;
    configData.Host = require('os').hostname();
    const updatedJsonString = JSON.stringify(configData, null, 2);
    fs.writeFileSync('config.json', updatedJsonString, 'utf-8');

    console.log(`Server is running at http://${ipAddress}:${port}`);
  });
}

createServer();