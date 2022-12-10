import { CookieMap, createPolicy, parseCookies } from "../utils";
import * as AWS from "@aws-sdk/client-dynamodb";
var aws = require('aws-sdk');

type eventBody = { title: string; description: string };

exports.handler = async function (event: any) {
  console.log('[EVENT]', event);


  aws.config.update({ region: 'us-east-1'});

  // Get event params
  const { title, description }: eventBody = JSON.parse(event.body);

  const cookies: CookieMap = parseCookies(event);

  if (!cookies) {

		console.log('[ERROR] No cookies found');

		return {
			principalId: '',
			policyDocument: createPolicy(event, 'Deny'),
		};
	}

  const verifiedJwt = cookies.token;

  // Get UserID from cognito
  const cognito = new aws.CognitoIdentityServiceProvider();
  const p = {
    AccessToken: verifiedJwt,
  };
  const user = await cognito.getUser(p).promise();
  const userId = user.Username;

  const ddbClient = new AWS.DynamoDB({ region: 'us-east-1', });

  // Create ddb table from client
  ddbClient.createTable({
    TableName: 'Blogs',
    AttributeDefinitions: [
      {
        AttributeName: 'userID',
        AttributeType: 'S'
      },
      {
        AttributeName: 'title',
        AttributeType: 'S'
      },
      {
        AttributeName: 'description',
        AttributeType: 'S'
      }
    ],
    KeySchema: [],
  });


  console.log('[DB-CONFIG]', ddbClient.config);

  // Add post to dynamoDB
  const params = {
    TableName: "Blogs",
    Item: {
      userID: {S: userId},
      title: {S: title },
      description: {S: description},
    },
  };

  console.log('[DDB]', params);

  try {

    const res = await ddbClient.send(new AWS.PutItemCommand(params));
    console.log('[DYNAMODB]', res);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err,
      }),
    };
  }
};
