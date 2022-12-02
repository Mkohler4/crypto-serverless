import * as cdk from 'aws-cdk-lib';
import { AuthApi } from './auth_api';
import { ProtectedApi } from './protected_api';
import { CognitoUserPool } from './user_pool';


export class ServerlessAuthStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);



    const userPool = new CognitoUserPool(this, 'UserPool');

		const { userPoolID, userPoolClientID } = userPool;

		new AuthApi(this, 'AuthServiceApi', {
			userPoolID,
			userPoolClientID,
		});

		new ProtectedApi(this, 'ProtectedApi', {
			userPoolID,
			userPoolClientID,
		});
  }
}
