import * as cdk from 'aws-cdk-lib';

// Create me a backend stack that initializes my database
export class CryptoDatabaseStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}