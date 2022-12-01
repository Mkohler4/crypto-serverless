import { RemovalPolicy } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class CognitoUserPool extends Construct{

  readonly userPoolID: string;
  readonly userPoolClientID: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const userPool = new UserPool(this, 'crypto-user-pool', {
			signInAliases: { username: true, email: true },
			selfSignUpEnabled: true,
			removalPolicy: RemovalPolicy.DESTROY,
		});

    const appClient = userPool.addClient('AppClient', {
			authFlows: {userPassword: true },
		});

    this.userPoolID = userPool.userPoolId;
		this.userPoolClientID = appClient.userPoolClientId;
  }
}