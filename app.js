const libphonenumberModule = require('libphonenumber-js');
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '.');
  },
  filename: function (req, file, cb) {
    cb(null, 'file-to-be-parsed');
  },
});

const upload = multer({ storage: storage });

const app = express();

function isEmpty(obj) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

function phoneNumberParser(data) {
  const regexp = /[^\d\s-()\.\+]/;
  let resultArray = [];
  let phoneNumber;
  let checkDuplicate = false;
  let arrayOfStrings = data.split(regexp);
  for (let i = 0; i < arrayOfStrings.length; i += 1) {
    phoneNumber = libphonenumberModule.parse(arrayOfStrings[i], 'CA');
    if (!isEmpty(phoneNumber)) {
      let formattedPhoneNumber = libphonenumberModule.format({ country: 'CA', phone: phoneNumber.phone }, 'National');
      for (let j = 0; j < resultArray.length; j += 1) {
        if (resultArray[j] === formattedPhoneNumber) {
          checkDuplicate = true;
          break;
        }
      }
      let isNumberValid = libphonenumberModule.isValidNumber(phoneNumber);
      if (checkDuplicate === false && isNumberValid === true) {
        resultArray.push(formattedPhoneNumber);
      }
      checkDuplicate = false;
    }
  }
  return resultArray;
}

app.get('/api/phonenumbers/parse/text/:string', function (req, res) {
  let result = phoneNumberParser(req.params.string);
  res.status(200).json(result);
});

app.get('/api/phonenumbers/parse/text/', function (req, res) {
  let result = [];
  res.status(200).json(result);
});

app.get('*', function (req, res) {
  // Invalid URL
  res.status(404).end();
});

app.post('/api/phonenumbers/parse/file', upload.single('file'), function (req, res) {
  if (!req.file) {
    // No file received
    res.status(400).end();
  } else {
    fs.readFile(req.file.path, 'utf8', (err, data) => {
      if (err) throw err;
      let fileContent = Buffer.from(data, 'base64').toString();
      let result = phoneNumberParser(fileContent);
      res.status(200).json(result);
    });
    // Deleting uploaded file
    fs.unlink(req.file.path, (err, data) => {
      if (err) throw err;
    });
  }
});

app.post('*', function (req, res) {
  // Invalid URL
  res.status(404).end();
});

app.listen(3000, () => console.log('Server started on port 3000...'));
