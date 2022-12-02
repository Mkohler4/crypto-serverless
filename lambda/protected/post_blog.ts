type eventBody = { title: string; description: string };

exports.handler = async function (event: any) {
  console.log('[EVENT]', event);

  // Get event params
  const { title, description }: eventBody = JSON.parse(event.body);

  // Get UserID from cognito
  const userId = event.requestContext.authorizer.claims.sub;



	return {
		statusCode: 200,
		body: 'You received a super secret!!',
	};
};