import { AppContext } from '../template/app_context';
import { BaseStack } from '../template/base/base_stack';
import { AuthApi } from './auth_api';
import { ProtectedApi } from './protected_api';
import { CognitoUserPool } from './user_pool';


export class ServerlessAuthStack extends BaseStack {
  constructor(appContext: AppContext, stackConfig: any) {
    super(appContext, stackConfig);

    const userPool = new CognitoUserPool(this, 'UserPool');

		const { userPoolID, userPoolClientID } = userPool;

		this.putParameter('userPoolID', userPoolID);
		this.putParameter('userPoolClientID', userPoolClientID);

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
