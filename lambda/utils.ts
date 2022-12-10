import {
	APIGatewayRequestAuthorizerEvent,
	APIGatewayAuthorizerEvent,
	PolicyDocument,
	APIGatewayProxyEvent,
} from 'aws-lambda';
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { CognitoAccessTokenPayload } from 'aws-jwt-verify/jwt-model';

const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

export type CookieMap = { [key: string]: string } | undefined;
export type JwtToken = { sub: string; email: string } | null;
export type Jwk = {
	keys: {
		alg: string;
		e: string;
		kid: string;
		kty: string;
		n: string;
		use: string;
	}[];
};

export const parseCookies = (event: APIGatewayRequestAuthorizerEvent | APIGatewayProxyEvent) => {
	if (!event.headers || !event.headers.Cookie) {
		return undefined;
	}

	const cookiesStr = event.headers.Cookie;
	const cookiesArr = cookiesStr.split(';');

	const cookieMap: CookieMap = {};

	for (let cookie of cookiesArr) {
		const cookieSplit = cookie.trim().split('=');
		cookieMap[cookieSplit[0]] = cookieSplit[1];
	}

	return cookieMap;
};

export const verifyToken = async (token: string, userPoolId: string, clientId: string): Promise<CognitoAccessTokenPayload | null> => {
	try {
		const verifier = CognitoJwtVerifier.create({
			userPoolId: userPoolId,
			tokenUse: "access",
			clientId: clientId,
		});

		// verify jwt and set token claim to access
		return await verifier.verify(token);

	} catch (err) {
		console.log(err);
		return null;
	}
};

export const createPolicy = (event: APIGatewayAuthorizerEvent, effect: string): PolicyDocument => {
	return {
		Version: '2012-10-17',
		Statement: [
			{
				Effect: effect,
				Action: 'execute-api:Invoke',
				Resource: [event.methodArn],
			},
		],
	};
};