// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const md5 = require('crypto-js/md5');


const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * generates short URL and put item to a DynamoDB table.
 */
exports.putItemHandler = async (event) => {
    const { body, httpMethod, path } = event;
    if (httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${httpMethod} method.`);
    }
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.log('received:', JSON.stringify(event));

    // Get id and name from the body of the request
    const { url } = JSON.parse(body);
    if(!url){
        throw new Error(`url is empty in body, need to input.`);
    }
    const shortUrl = shortURL(url);

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    const params = {
        TableName: tableName,
        Item: { url, shortUrl },
    };
    await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: {shortUrl},
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};

function shortURL(url) {
   return md5(url).toString().slice(0, 8);
}
