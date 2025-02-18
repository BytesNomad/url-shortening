// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');

// Import all functions from get-by-id.js
const lambda = require('../../../src/handlers/get-by-id.js');

// This includes all tests for getByIdHandler
describe('Test getByIdHandler', () => {
    let getSpy;

    // One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
    beforeAll(() => {
        // Mock DynamoDB get method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
        getSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'get');
    });

    // Clean up mocks
    afterAll(() => {
        getSpy.mockRestore();
    });

    // This test invokes getByIdHandler and compares the result
    it('should get url by shortUrl', async () => {
        const item = { shortUrl: '8c2f2e0c', url: 'http://www.aws.com' };

        // Return the specified value whenever the spied get function is called
        getSpy.mockReturnValue({
            promise: () => Promise.resolve({ Item: item }),
        });

        const event = {
            httpMethod: 'GET',
            path: '/8c2f2e0c',

        };

        // Invoke getByIdHandler
        const result = await lambda.getByIdHandler(event);

        const expectedResult = {
            statusCode: 301,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Location': 'http://www.aws.com'
            },
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });

    it('should error when use none GET method', async () => {
        const item = { shortUrl: '8c2f2e0c', url: 'http://www.aws.com' };

        // Return the specified value whenever the spied get function is called
        getSpy.mockReturnValue({
            promise: () => Promise.resolve({ Item: item }),
        });
        const event = {
            httpMethod: 'POST',
            path: '/8c2f2e0c',

        };
        const result = await lambda.getByIdHandler(event);
        const expectedResult = {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 400,
            body: JSON.stringify({success: false, error: "getMethod only accept GET method, you tried: POST", data: {}}),
        };
        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);

    });
    it('should error when path is empty ', async () => {
        const item = { shortUrl: '8c2f2e0c', url: 'http://www.aws.com' };

        // Return the specified value whenever the spied get function is called
        getSpy.mockReturnValue({
            promise: () => Promise.resolve({ Item: item }),
        });
        const event = {
            httpMethod: 'POST',
            path: '',

        };
        const result = await lambda.getByIdHandler(event);
        const expectedResult = {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 400,
            body: JSON.stringify({success: false, error: "shortUrl is empty in path, need to input.", data: {}}),
        };
        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);

    });
    it('should error when get by unknown short URL ', async () => {

        // Return the specified value whenever the spied get function is called
        getSpy.mockReturnValue({
            promise: () => Promise.resolve({}),
        });
        const event = {
            httpMethod: 'GET',
            path: '/8c2f2e0c',

        };
        const result = await lambda.getByIdHandler(event);
        const expectedResult = {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            statusCode: 404,
            body: JSON.stringify({success: false, error: "can\'t find URL by ShortUrl: 8c2f2e0c", data: {}}),

        };
        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });

});
