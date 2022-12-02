import { Duration } from 'aws-cdk-lib';
import { RestApi, EndpointType, Cors, AuthorizationType,
    IdentitySource, LambdaIntegration, RequestAuthorizer, JsonSchemaType, RequestValidator,
} from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

type ProtectedApiProps = {
	userPoolID: string;
	userPoolClientID: string;
	tableName: string;
};

export class ProtectedApi extends Construct {
	constructor(scope: Construct, id: string, props: ProtectedApiProps) {
		super(scope, id);

    const api = new RestApi(this, 'ProtectedApi', {
			description: 'Protected RestApi',
			endpointTypes: [EndpointType.REGIONAL],
			defaultCorsPreflightOptions: {
				allowOrigins: Cors.ALL_ORIGINS,
			},
		});

    const protectedRes = api.root.addResource('protected');

    const commonFnProps = {
			runtime: Runtime.NODEJS_16_X,
			handler: 'handler',
      setTimeout: 10,
			environment: {
				USER_POOL_ID: props.userPoolID,
				CLIENT_ID: props.userPoolClientID,
			},
		};

    const protectedFn = new NodejsFunction(this, 'ProtectedFn', {
			...commonFnProps,
			entry: './lambda/protected.ts',
		});

    const authorizerFn = new NodejsFunction(this, 'AuthorizerFn', {
			...commonFnProps,
			entry: './lambda/auth/authorizer.ts',
		});

		const post_blog = new NodejsFunction(this, 'PostBlogFn', {
			...commonFnProps,
			entry: './lambda/protected/post-blog.ts',
		});

    const requestAuthorizer = new RequestAuthorizer(this, 'RequestAuthorizer', {
			identitySources: [IdentitySource.header('cookie')],
			handler: authorizerFn,
			resultsCacheTtl: Duration.seconds(0),
		});

    protectedRes.addMethod('GET', new LambdaIntegration(protectedFn), {
			authorizer: requestAuthorizer,
			authorizationType: AuthorizationType.CUSTOM,
		});

		// Create model and attach it to method
    const post_blog_validator = api.addModel('post-blog-validator', {
      description: "Validates the request body for the POST /blog method",
      contentType: 'application/json',
      modelName: 'PostBlogModel',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: ["title", "description"],
        properties: {
          title: {
            type: JsonSchemaType.STRING
          },
          description: {
            type: JsonSchemaType.STRING
          },
        },
    }});

		const blog = protectedRes.addResource('blog');
		blog.addMethod('POST', new LambdaIntegration(post_blog), {
			authorizer: requestAuthorizer,
			authorizationType: AuthorizationType.CUSTOM,
			requestValidator: new RequestValidator(
				this,
        "body-validator",
        {
          restApi: api,
          requestValidatorName: "body-validator",
          validateRequestBody: true,
        }
      ),
      requestModels: {
        "application/json": post_blog_validator,
      },
		});
  }
}