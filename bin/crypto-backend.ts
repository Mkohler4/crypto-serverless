#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessAuthStack } from '../lib/auth/auth_stack';

const app = new cdk.App();

// Lambda Functions
new ServerlessAuthStack(app, 'ServerlessAuthStack', {});
