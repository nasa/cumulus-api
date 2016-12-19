'use strict';

import should from 'should';
import schema from '../../lib/schemas/granule';
import create from '../../lib/model';

describe('schemas/granule', function () {
  it('is a valid schema', function (done) {
    const validate = create(schema);
    done();
  });
});
