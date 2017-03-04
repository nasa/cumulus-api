/**
 * This module helps with returning approporiate
 * response via API Gateway Lambda Proxies
 *
 * With the lambda proxy integration, the succeed method of
 * the context object should always be called. It accepts
 * an object that expects a statusCode, headers and body
 */
'use strict';

export default function response(context, err, body, status = null) {
  if (typeof context.succeed !== 'function') {
    throw new Error('context object with succeed method not provided');
  }

  let b;
  let statusCode;

  if (err) {
    b = {
      error: JSON.stringify(err)
    };
    statusCode = status || 400;
  }
  else {
    if (typeof body === 'string') {
      b = { detail: body };
    }
    else {
      b = body;
    }
    statusCode = status || 200;
  }

  const res = {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(b)
  };

  return context.succeed(res);
}
