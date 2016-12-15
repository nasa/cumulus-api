'use strict';

import should from 'should';
import schema from '../../lib/schemas/dataset';
import create from '../../lib/model';

describe('schemas/dataset', function () {
  it('is a valid schema', function (done) {
    const validate = create(schema);
    done();
  });
});
