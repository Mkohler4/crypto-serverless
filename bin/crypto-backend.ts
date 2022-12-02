#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessAuthStack } from '../lib/auth/auth_stack';
import { AppContext, AppContextError } from '../lib/template/app_context';

const app = new cdk.App();

/// Use export APP_CONFIG=config/app_config.json
/// To expose the APP_CONFIG environment variable
try{
  const appContext = new AppContext({
    appConfigFileKey: 'APP_CONFIG',
  });
}
catch(error){
  if (error instanceof AppContextError) {
    console.error('[AppContextError]:', error.message);
  } else {
      console.error('[Error]: not-handled-error', error);
  }
}

// Lambda Functions
new ServerlessAuthStack(app, 'ServerlessAuthStack', {});
