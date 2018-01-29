// Copyright (c) 2016 @catamphetamine <purecatamphetamine@gmail.com>
// This software uses libphonenumber-js
// https://github.com/catamphetamine/libphonenumber-js

const libphonenumberModule = require('libphonenumber-js');

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;
}

function phoneNumberParser(data) {
  var resultArray = [];
  var phoneNumber;
  var checkDuplicate = false;
  var re = /[A-Za-z_\s]/;
  var arrayOfStrings = data.split(re);
  for (var i = 0; i < arrayOfStrings.length; i++) {
    phoneNumber = libphonenumberModule.parse(arrayOfStrings[i], 'CA');
    if (!isEmpty(phoneNumber)) {
      var formattedPhoneNumber = libphonenumberModule.format({ country: 'CA', phone: phoneNumber.phone }, 'National');
      for (var j = 0; j < resultArray.length; j++) {
        if (resultArray[j] === formattedPhoneNumber) {
          checkDuplicate = true;
          break;
        }
      }
      var isNumberValid = libphonenumberModule.isValidNumber(phoneNumber);
      if (checkDuplicate === false && isNumberValid === true) {
        resultArray.push(formattedPhoneNumber);
      }
      checkDuplicate = false;
    }
  }
  return resultArray;
}

app.get('/api/phonenumbers/parse/text/:name', function(req, res) {
  var result = phoneNumberParser(req.params.name);
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).json(result);
});

app.get('/api/phonenumbers/parse/text/', function(req, res) {
  var result = [];
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).json(result);
});

app.get('*', function(req, res) {
  // Invalid URL
  res.status(404).end();
});

app.post('/api/phonenumbers/parse/file', upload.single('file'), function(req, res) {
  if (!req.file) {
    // No file received
    res.status(400).end();
  } else if (path.extname(req.file.originalname) != '.txt') {
    // Invalid File Format
    res.status(415).end();
    // Deleting uploaded file
    fs.unlink(req.file.path, (err, data) => {
      if (err) throw err;
    });
  } else {
    fs.readFile(req.file.path, 'utf8', (err, data) => {
      if (err) throw err;
      var buffer = new Buffer(data, 'base64')
      var fileContent = buffer.toString();
      var result = phoneNumberParser(fileContent);
      res.setHeader('Content-Type', 'text/plain');
      res.status(200).json(result);
    });
    // Deleting uploaded file
    fs.unlink(req.file.path, (err, data) => {
      if (err) throw err;
    });
  }
});

app.listen(3000, () => console.log('Server started on port 3000...'));
