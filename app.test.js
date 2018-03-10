const request = require('supertest');
const app = require('./app');
const fs = require('fs');
const address = 'http://localhost:3000';
const postURL = '/api/phonenumbers/parse/file';
const postURLDoc = '/api/phonenumbers/parse/doc';
const postUrlImage = '/api/phonenumbers/parse/image';
const getUrlWithNumber = '/api/phonenumbers/parse/text/absds6474727272afa6475695656asdsad';
const getUrlWithoutNumber = '/api/phonenumbers/parse/text/';
const getUrlWithURL = '/api/phonenumbers/url/http/?url=http://www.senecacollege.ca/contact';

describe('Testing GET requests:', () => {

  test('GET request with empty URL', done => {
    return request(address).get(getUrlWithoutNumber).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[]');
      done();
    });
  });

  test('GET request with URL containing valid numbers', done => {
    return request(address).get(getUrlWithNumber).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[\"(647) 472-7272\",\"(647) 569-5656\"]');
      done();
    });
  });

  test('GET request with URL containing URL of the resource', done => {
    return request(address).get(getUrlWithURL).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[\"(416) 491-5050\",\"(416) 491-8811\",\"(905) 833-1650\"]');
      done();
    });
  });

});

describe('Testing POST requests:', () => {

  test('POST request with file containing valid numbers', done => {
    return request(address)
      .post(postURL)
      .set('Content-Type', 'text/plain')
      .attach('file', fs.readFileSync('./test_file_valid_numbers.txt'), 'testfile1.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(647) 472-2593\",\"(647) 425-5696\",\"(867) 425-6565\"]');
        done();
      });
  });
  
  test('POST request with file containing invalid numbers', done => {
    return request(address)
      .post(postURL)
      .set('Content-Type', 'text/plain')
      .attach('file', fs.readFileSync('./test_file_invalid_numbers.txt'), 'testfile2.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[]');
        done();
      });
  });

  test('POST request with MS Word file containing valid numbers', done => {
    return request(address)
      .post(postURLDoc)
      .set('Content-Type', 'application/octet-stream')
      .attach('file', fs.readFileSync('./test_input.docx'), 'testfile3.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(416) 491-5050\",\"(416) 491-8811\",\"(905) 833-1650\"]');
        done();
      });
  });

  test('POST request with image 1 containing valid numbers', done => {
    jest.setTimeout(20000);
    return request(address)
      .post(postUrlImage)
      .attach('file', fs.readFileSync('./images-for-testing/test_image_seneca_contacts.jpg'), 'testImage.jpg')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(416) 491-5050\",\"(416) 491-8811\",\"(905) 833-1650\"]');
        done();
      });
  });

  test('POST request with image 2 containing valid numbers', done => {
    jest.setTimeout(20000);
    return request(address)
      .post(postUrlImage)
      .attach('file', fs.readFileSync('./images-for-testing/test_image_ctv_contacts.jpg'), 'testImage.jpg')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(416) 384-5000\",\"(866) 690-6179\",\"(800) 668-0060\",\"(800) 461-1542\"]');
        done();
      });
  });

  test('POST request with image 3 containing valid numbers', done => {
    return request(address)
      .post(postUrlImage)
      .attach('file', fs.readFileSync('./images-for-testing/test_image_toronto_zoo_contacts.jpg'), 'testImage.jpg')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(416) 392-5900\",\"(416) 392-5934\",\"(416) 392-9114\",\"(416) 392-9115\",\"(416) 392-5962\",\"(416) 392-4979\",\"(416) 392-5940\",\"(416) 392-5863\",\"(416) 392-5947\",\"(416) 392-5948\",\"(416) 392-5932\",\"(416) 392-5944\",\"(416) 392-5924\",\"(416) 393-6364\",\"(416) 392-5929\",\"(416) 393-6339\",\"(416) 392-5905\",\"(416) 392-9101\"]');
        done();
      });
  });

});
