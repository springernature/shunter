#Tests - client

Tests for client-side JS are written for Mocha, run with mocha-phantomjs, with Sinon for stubbing and Proclaim for assertions.

While you save your tests for client-side JS in tests/client in your own project, the test script is part of shunter because it requires Mincer middleware to handle the resources properly.

To run all client-side JS tests, from the command line at shunter-proxy's root run `node ./node_modules/shunter/test-client`.  This will run all the tests in test/client against all the code that comes from main.js.ejs being compiled by Mincer.

To test just one specific test file, run
`node ./node_modules/shunter/test-client --spec some-spec.js`

