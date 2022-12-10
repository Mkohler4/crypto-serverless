var aws = require('aws-sdk');

export function getCognitoIdentityId(
  jwtToken: string,
): Promise<string> | never {
  const params = getCognitoIdentityIdParams(jwtToken);
  const cognitoIdentity = new aws.CognitoIdentity();

  // 👇 get and return the identityId
  return cognitoIdentity
    .getId(params)
    .promise()
    .then((data: { IdentityId: any; }) => {
      if (data.IdentityId) {
        return data.IdentityId;
      }
      throw new Error('Invalid authorization token.');
    });
}

// 👇 construct the parameters for the getId method
function getCognitoIdentityIdParams(jwtToken: string) {
  const {
    USER_POOL_ID,
    ACCOUNT_ID,
    IDENTITY_POOL_ID,
    AWS_DEFAULT_REGION,
  } = process.env;
  const loginsKey = `cognito-idp.${AWS_DEFAULT_REGION}.amazonaws.com/${USER_POOL_ID}`;

  return {
    IdentityPoolId: IDENTITY_POOL_ID,
    AccountId: ACCOUNT_ID,
    Logins: {
      [loginsKey]: jwtToken,
    },
  };
}