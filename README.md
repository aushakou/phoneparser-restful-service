# phoneparser-restful-service

Phone number parser RESTful API web service.

## Getting Started

### Prerequisites

* Make sure you have [Node.js](https://nodejs.org/en/) installed.

### Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/aushakou/phoneparser-restful-service.git
    ```

2. Go to project's directory:
    ```bash
    cd phoneparser-restful-service
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Run the application:
    ```bash
    npm start
    ```

## Running the tests

* This project uses [Jest](https://facebook.github.io/jest/) for testing.

1. Run the test:
    ```bash
    npm test
    ```
2. Jest will print the following message if tests pass:
    ```bash
    PASS  .\app.test.js
        Testing GET requests:
            √ GET request with empty URL
            √ GET request with URL containing valid numbers
        Testing POST requests:
            √ POST request with file containing valid numbers
            √ POST request with file containing invalid numbers
    ```

## Usage

1. GET request `http://localhost:3000/api/phonenumbers/parse/text/{...string...}` allows a text to be parsed.

For example, requesting `/api/phonenumbers/parse/text/nothing` should return an empty list []. 
Whereas requesting requesting `/api/phonenumbers/parse/text/Seneca%20Phone%20Number%3A%20416-491-5050` should return a list with a single, formatted phone number ["(416) 491-5050"].

2. POST request `http://localhost:3000/api/phonenumbers/parse/file` with the body containing a base64 encoded text file, allows a file to be processed.

Note 1: All responses from the API will be given in JSON format.
Note 2: Phone numbers returned from any of the endpoints above will not be duplicated.

## Built With

* [Node.js](https://nodejs.org/en/) - JavaScript run-time environment
* [Express](https://expressjs.com/) - The web framework
* [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) - Javascript rewrite of Google's [libphonenumber](https://github.com/googlei18n/libphonenumber) library

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details