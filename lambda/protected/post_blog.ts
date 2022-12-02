// Import dynamodb
var aws = require('aws-sdk');

type eventBody = { title: string; description: string };

exports.handler = async function (event: any) {
  console.log('[EVENT]', event);

  // Get event params
  const { title, description }: eventBody = JSON.parse(event.body);

  // Get UserID from cognito
  const userId = event.requestContext.authorizer.claims.sub;

  // Set the region
  aws.config.update({region: 'REGION'});

  // Create DynamoDB service object
  var ddb = new aws.DynamoDB({apiVersion: '2012-08-10'});


  // Add post to dynamoDB
  const params = {
    TableName: process.env.POSTS_TABLE!,
    Item: {
      id: uuidv4(),
      userId,
      title,
      description,
    },
  };

  try {
    const res = await ddb.put(params).promise();
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

function uuidv4() {
    throw new Error("Function not implemented.");
  }
