/**
 * This module helps with returning approporiate
 * response via API Gateway Lambda Proxies
 *
 * With the lambda proxy integration, the succeed method of
 * the context object should always be called. It accepts
 * an object that expects a statusCode, headers and body
 */
'use strict';

import forge from 'node-forge';
import auth from 'basic-auth';
import { User } from 'cumulus-common/models';
import { Response, Request } from 'lambda-proxy-utils';

export default function response(context, err, body, status = null) {
  if (typeof context.succeed !== 'function') {
    throw new Error('context object with succeed method not provided');
  }

  if (err) {
    status = status || 400;
    if (typeof body === 'string') {
      body = { detail: err };
    }
    else {
      body = err;
    }
  }

  const res = new Response({ cors: true, statusCode: status });
  return context.succeed(res.send(body));
}

export function handle(event, context, authCheck, func) {
  if (typeof context.succeed !== 'function') {
    throw new Error('context object with succeed method not provided');
  }

  const cb = response.bind(null, context);
  if (authCheck) {
    const req = new Request(event);
    const user = auth(req);

    if (!user) {
      return cb('Invalid Authorization token');
    }

    // hash password
    const md = forge.md.md5.create();
    md.update(user.pass);

    // get the user
    const u = new User();
    u.get({ userName: user.name }).then(userObj => {
      if (userObj.password === md.digest().toHex()) {
        return func(cb);
      }
      return cb('Invalid Authorization token');
    }).catch(e => cb(e));
  }
  else {
    func(cb);
  }
}
