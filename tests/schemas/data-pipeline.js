'use strict';

import should from 'should';
import schema from '../../lib/schemas/data-pipeline';
import create from '../../lib/model';

describe('schemas/data-pipeline', function () {
  it('is a valid schema', function (done) {
    const validate = create(schema);
    done();
  });
});
