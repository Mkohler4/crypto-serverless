// import * as lambda from '@aws-cdk/aws-lambda';
// import * as documetdb from '@aws-cdk/aws-docdb';
// import * as ec2 from '@aws-cdk/aws-ec2';
// import * as cdk from '@aws-cdk/core';


// export interface HitCounterProps {
//   /** the function for which we want to count url hits **/
//   downstream: lambda.IFunction;
// }

// export class HitCounter extends cdk.Construct {

//   public readonly handler: lambda.Function;

//   constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
//     super(scope, id);

//     const vpc = new ec2.Vpc(this, 'VPC', {

//     });

//     const docuDB = new documetdb.DatabaseCluster(this, 'Hits', {
//       masterUser: {
//         username: 'Markus',
//       },
//       instanceType: ec2.InstanceType.of(ec2.InstanceClass.R5, ec2.InstanceSize.LARGE),
//       vpcSubnets: {
//         subnetType: ec2.SubnetType.PUBLIC,
//       },
//       vpc,
//       deletionProtection: true,
//     });

//     docuDB.connections.allowDefaultPortFromAnyIpv4('Open to the world');

//     this.handler = new lambda.Function(this, 'HitCounterHandler', {
//       runtime: lambda.Runtime.NODEJS_14_X,
//       handler: 'hitcounter.handler',
//       code: lambda.Code.fromAsset('lambda'),
//       environment: {
//         DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
//         CLUSTER_IDENTIFIER: docuDB.clusterIdentifier,
//       }
//     });

//     props.downstream.grantInvoke(this.handler);
//   }
// }

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;
}

export class Network extends Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: {
            DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
            HITS_TABLE_NAME: this.table.tableName
        }
    });

    this.table.grantReadWriteData(this.handler);
    props.downstream.grantInvoke(this.handler);
  }
}