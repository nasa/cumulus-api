/**
 * This module helps with returning approporiate
 * response via API Gateway Lambda Proxies
 *
 * With the lambda proxy integration, the succeed method of
 * the context object should always be called. It accepts
 * an object that expects a statusCode, headers and body
 */
'use strict';

import { Response } from 'lambda-proxy-utils';

export default function response(context, err, body, status = null) {
  if (typeof context.succeed !== 'function') {
    throw new Error('context object with succeed method not provided');
  }

  if (err) {
    status = status || 400;
  }

  const res = new Response({ cors: true, statusCode: status });

  res.cookie('testing', 'not working');

  return context.succeed(res.send(body));
}
