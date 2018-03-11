const libphonenumberModule = require('libphonenumber-js');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const request = require('request');
const validUrl = require('valid-url');
const mammoth = require('mammoth');
const path = require('path');
const tesseractjs = require('tesseract.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '.');
  },
  filename: (req, file, cb) => {
    cb(null, 'file-to-be-parsed');
  },
});
const upload = multer({ storage });

const Tesseract = tesseractjs.create({
  workerPath: path.join(__dirname, './node_modules/tesseract.js/src/node/worker.js'),
  langPath: path.join('./eng.traineddata'),
  corePath: path.join(__dirname, './node_modules/tesseract.js/src/index.js'),
});

const app = express();

function isEmpty(obj) {
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  }
  return false;
}

function phoneNumberParser(data) {
  const regexp = /[^\d\s-().+]/;
  const arrayOfStrings = data.split(regexp);
  const resultArray = [];
  let phoneNumber;
  let checkDuplicate = false;
  for (let i = 0; i < arrayOfStrings.length; i += 1) {
    phoneNumber = libphonenumberModule.parse(arrayOfStrings[i], 'CA');
    if (!isEmpty(phoneNumber)) {
      const formattedPhoneNumber = libphonenumberModule.format({ country: 'CA', phone: phoneNumber.phone }, 'National');
      for (let j = 0; j < resultArray.length; j += 1) {
        if (resultArray[j] === formattedPhoneNumber) {
          checkDuplicate = true;
          break;
        }
      }
      const isNumberValid = libphonenumberModule.isValidNumber(phoneNumber);
      if (checkDuplicate === false && isNumberValid === true) {
        resultArray.push(formattedPhoneNumber);
      }
      checkDuplicate = false;
    }
  }
  return resultArray;
}

app.get('/api/phonenumbers/url/http/', (req, res) => {
  // Object destructuring
  const { url } = req.query;
  let result;
  if (!validUrl.isWebUri(url)) {
    res.status(400).end();
  }
  request({ uri: url }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      res.status(400).end();
    } else {
      result = phoneNumberParser(body);
      res.status(200).json(result);
    }
  });
});

app.get('/api/phonenumbers/parse/text/:string', (req, res) => {
  const result = phoneNumberParser(req.params.string);
  res.status(200).json(result);
});

app.get('/api/phonenumbers/parse/text/', (req, res) => {
  const result = [];
  res.status(200).json(result);
});

app.post('/api/phonenumbers/parse/image', upload.single('file'), (req, res) => {
  if (!req.file) {
    // No file attached
    res.status(400).end();
  } else {
    const fileType = (req.file.mimetype).split('/');
    if (fileType[0] !== 'image') {
      // Uploaded file is not an image
      res.status(400).end();
    } else {
      Tesseract.recognize(req.file.path)
        .then((result) => { res.status(200).json(phoneNumberParser(result.text)); });
    }
    // Deleting uploaded file
    fs.unlinkSync(req.file.path);
  }
});

app.get('*', (req, res) => {
  // Invalid URL
  res.status(404).end();
});

app.post('/api/phonenumbers/parse/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    // No file received
    res.status(400).end();
  } else {
    fs.readFile(req.file.path, 'utf8', (err, data) => {
      if (err) throw err;
      const fileContent = Buffer.from(data, 'base64').toString();
      const result = phoneNumberParser(fileContent);
      res.status(200).json(result);
    });
    // Deleting uploaded file
    fs.unlinkSync(req.file.path);
  }
});

app.post('/api/phonenumbers/parse/doc', upload.single('file'), (req, res) => {
  if (!req.file) {
    // No file received
    res.status(400).end();
  } else {
    mammoth.extractRawText({ path: req.file.path }).then((data) => {
      const result = phoneNumberParser(data.value);
      res.status(200).json(result);
    });
    // Deleting uploaded file
    fs.unlinkSync(req.file.path);
  }
});

app.post('*', (req, res) => {
  // Invalid URL
  res.status(404).end();
});

app.listen(3000);
