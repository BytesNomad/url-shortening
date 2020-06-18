// Import dynamodb from aws-sdk
const dynamodb = require('aws-sdk/clients/dynamodb');

// Import all functions from put-item.js
const lambda = require('../../../src/handlers/put-item.js');

// This includes all tests for putItemHandler
describe('Test putItemHandler', () => {
    let putSpy;

    // One-time setup and teardown, see more in https://jestjs.io/docs/en/setup-teardown
    beforeAll(() => {
        // Mock DynamoDB put method
        // https://jestjs.io/docs/en/jest-object.html#jestspyonobject-methodname
        putSpy = jest.spyOn(dynamodb.DocumentClient.prototype, 'put');
    });

    // Clean up mocks
    afterAll(() => {
        putSpy.mockRestore();
    });

    // This test invokes putItemHandler and compares the result
    it('should add url to the table', async () => {
        // Return the specified value whenever the spied put function is called
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });
        const event = {
            httpMethod: 'POST',
            body: '{"url":"http://www.aws.com"}',
        };
        // Invoke putItemHandler()
        const result = await lambda.putItemHandler(event);
        const expectedResult = {
            statusCode: 200,
            body: {shortUrl: '8c2f2e0c'},
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };

        // Compare the result with the expected result
        expect(result).toEqual(expectedResult);
    });

    it('should error when use none POST method', async () => {

        // Return the specified value whenever the spied get function is called
        putSpy.mockReturnValue({
            promise: () => Promise.resolve('data'),
        });
        const event = {
            httpMethod: 'GET',
            body: '{"url":"http://www.aws.com"}',
        };
        await expect(lambda.putItemHandler(event)).rejects.toThrowError("postMethod only accepts POST method, you tried: GET method.");
    });
    it('should error when no url in body ', async () => {

        // Return the specified value whenever the spied get function is called
        putSpy.mockReturnValue({
            promise: () => Promise.resolve({}),
        });
        const event = {
            httpMethod: 'POST',
            body: '{"urlxxxx":"http://www.aws.com"}',
        };
        await expect(lambda.putItemHandler(event)).rejects.toThrowError("url is empty in body, need to input.");
    });
});
