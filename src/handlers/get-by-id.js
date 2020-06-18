// Create clients and set shared const values outside of the handler

// Create a DocumentClient that represents the query to get an item
const dynamodb = require('aws-sdk/clients/dynamodb');

const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * get URL by short URL from a DynamoDB table.
 */
exports.getByIdHandler = async (event) => {
    const { httpMethod, path, pathParameters } = event;
    if (httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${httpMethod}`);
    }
    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.log('received:', JSON.stringify(event));

    // Get id from pathParameters from APIGateway because of `/{id}` at template.yml
    const { shortUrl } = pathParameters;

    if(!shortUrl){
        throw new Error(`shortUrl is empty in pathParameters, need to input.`);
    }

    // Get the item from the table
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
    const params = {
        TableName: tableName,
        Key: { shortUrl },
    };
    const { Item } = await docClient.get(params).promise();

    if(!Item){
        throw new Error(`can't find URL by ShortUrl: `+shortUrl);
    }

    const response = {
        statusCode: 301,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Location': Item.url
        },
    };

    console.log(`response from: ${path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
