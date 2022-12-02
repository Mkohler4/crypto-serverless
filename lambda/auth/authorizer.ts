import { APIGatewayAuthorizerResult, APIGatewayRequestAuthorizerEvent } from 'aws-lambda';
import { CookieMap, createPolicy, parseCookies, verifyToken } from '../utils';

exports.handler = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
	console.log('[EVENT]', event);

	const cookies: CookieMap = parseCookies(event);

	if (!cookies) {

		console.log('[ERROR] No cookies found');

		return {
			principalId: '',
			policyDocument: createPolicy(event, 'Deny'),
		};
	}

	const verifiedJwt = await verifyToken(cookies.token, process.env.USER_POOL_ID!);

	console.log('[AUTH]', verifiedJwt);

	return {
		principalId: verifiedJwt ? verifiedJwt.sub!.toString() : '',
		policyDocument: createPolicy(event, verifiedJwt ? 'Allow' : 'Deny'),
	};
};