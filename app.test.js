const request = require('supertest');
const app = require('./app');
const fs = require('fs');

const address = 'http://localhost:3000';
const postURL = '/api/phonenumbers/parse/file';
const postURLDoc = '/api/phonenumbers/parse/doc';
const getUrlWithNumber = '/api/phonenumbers/parse/text/absds6474727272afa6475695656asdsad';
const getUrlWithoutNumber = '/api/phonenumbers/parse/text/';
const getUrlWithURL = '/api/phonenumbers/url/http/?url=http://www.senecacollege.ca/contact';

describe('Testing GET requests:', () => {

  test('GET request with empty URL', () => {
    return request(address).get(getUrlWithoutNumber).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[]');
    });
  });

  test('GET request with URL containing valid numbers', () => {
    return request(address).get(getUrlWithNumber).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[\"(647) 472-7272\",\"(647) 569-5656\"]');
    });
  });

  test('GET request with URL containing URL of the resource', () => {
    return request(address).get(getUrlWithURL).then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.text).toBe('[\"(416) 491-5050\",\"(416) 491-8811\",\"(905) 833-1650\"]');
    });
  });

  

});

describe('Testing POST requests:', () => {

  test('POST request with file containing valid numbers', () => {
    return request(address)
      .post(postURL)
      .set('Content-Type', 'text/plain')
      .attach('file', fs.readFileSync('./test_file_valid_numbers.txt'), 'testfile1.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(647) 472-2593\",\"(647) 425-5696\",\"(867) 425-6565\"]');
    });
  });
  
  test('POST request with file containing invalid numbers', () => {
    return request(address)
      .post(postURL)
      .set('Content-Type', 'text/plain')
      .attach('file', fs.readFileSync('./test_file_invalid_numbers.txt'), 'testfile2.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[]');
    });
  });

  test('POST request with MS Word file containing valid numbers', () => {
    return request(address)
      .post(postURLDoc)
      .set('Content-Type', 'application/octet-stream')
      .attach('file', fs.readFileSync('./test_input.docx'), 'testfile3.txt')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('[\"(416) 491-5050\",\"(416) 491-8811\",\"(905) 833-1650\"]');
    });
  });

});
