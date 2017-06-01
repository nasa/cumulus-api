'use strict';

import test from 'ava';
import { sleep, errorify } from '../utils';

test('testing sleep function', (t) => {
  sleep(1000);
  t.pass();
});

test('testing errorify utility', (t) => {
  const err = new Error('some error');
  const errString = errorify(err);

  t.is(typeof errString, 'string');
});

