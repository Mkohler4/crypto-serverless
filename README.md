# Welcome to CryptoServerless

This project defines the AWS infrastructure Cognito, Lambda, and exposes two API Gateways (Auth API and Protected API). 

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

## How to select a target deployment

Set the path of this json configuration file through an environment variable. The key name of environment variable is `APP_CONFIG`

```bash
export APP_CONFIG=config/app-config.json
```

Or you can select this configuration file in command line like this:

 ```bash
 cdk deploy *DataProcessingStack --context APP_CONFIG=config/app-config.json
 ```

 Through this external configuration injection, multiple deployments(multiple account, multiple region, multiple stage) are possible without code modification.