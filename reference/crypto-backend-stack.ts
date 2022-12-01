import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Network } from './network';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CryptoBackendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'crypto-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required : true,
          mutable: true
        }
      }
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'crypto-user-pool-client', {userPool});



    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'hello.handler'
    });

    const helloWithCounter = new Network(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello" function.
    const api = new apigw.LambdaRestApi(this, 'CryptoBrackendAPI', {
      handler: helloWithCounter.handler,
      proxy: false,
    });

    // Create model and attach it to method
    const model = api.addModel('post-blog-validator', {
      description: "Validates the request body for the POST /blog method",
      contentType: 'application/json',
      modelName: 'PostBlogModel',
      schema: {
        type: apigw.JsonSchemaType.OBJECT,
        required: ["title", "description"],
        properties: {
          title: {
            type: apigw.JsonSchemaType.STRING
          },
          description: {
            type: apigw.JsonSchemaType.STRING
          },
        },
    }});

    // Define a resource
    const blogs = api.root.addResource('blog');
    blogs.addMethod('GET', new apigw.LambdaIntegration(helloWithCounter.handler), {
      authorizationType: apigw.AuthorizationType.COGNITO,
      requestParameters: {
        "method.request.querystring.id": true,
      },
      requestValidatorOptions: {
        requestValidatorName: "querystring-validator",
        validateRequestParameters: true,
        validateRequestBody: false,
      },
    });
    blogs.addMethod('POST', new apigw.LambdaIntegration(helloWithCounter.handler), {
      authorizationType: apigw.AuthorizationType.COGNITO,
      requestValidator: new apigw.RequestValidator(
        this,
        "body-validator",
        {
          restApi: api,
          requestValidatorName: "body-validator",
          validateRequestBody: true,
        }
      ),
      requestModels: {
        "application/json": model,
      },
    });

    new TableViewer(this, 'ViewHitCounter', {
      title: 'Table',
      table: helloWithCounter.table,
    })
  }
}
