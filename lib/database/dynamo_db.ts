import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { AppContext } from '../template/app_context';
import { BaseStack } from '../template/base/base_stack';

export class ServerlessDBStack extends BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    const table = new dynamodb.Table(this, 'crypto-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.putParameter('tableName', table.tableName);
  }
}