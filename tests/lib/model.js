'use strict';

import v from 'validimir';
import should from 'should';
import create from '../../lib/model';

describe('model module', function () {
  describe('creating a model', function () {
    it('throws when not passed a schema', function (done) {
      should.throws(() => create(null), 'A schema object must be passed to model#create');
      done();
    });

    it('validates', function (done) {
      const schema = {
        _type: 'map',
        _required: ['id', 'location'],
        _defaults: {
          location: 'usa'
        },
        id: v().number(),
        location: v().string(),
        description: v().string()
      };
      const validate = create(schema);
      let output = validate({
        description: 'foo'
      });

      should.deepEqual(
        Object.keys(output.data).sort(),
        ['description', 'location'].sort(),
        'validated data includes data, defaults'
      );
      should.equal(output.data.location, 'usa', 'sets default value');
      should.equal(output.errors[0].message, 'id is required', 'includes error messages')
      output = validate({ location: 'somewhere else' });
      should.equal(output.data.location, 'somewhere else', 'overwrites default');
      done();
    });

    it('applies metadata', function (done) {
      const schema = {
        _type: 'map',
        _meta: {
          a: 'a',
          b: {
            x: 'x',
            y: 'y'
          }
        }
      };
      const validate = create(schema);
      let output = validate({});
      should.equal(output.data.a, 'a', 'applies primitive meta value');
      should.exist(output.data.b, 'applies nested meta value');
      should.deepEqual(
        Object.keys(output.data.b).sort(),
        ['x', 'y'].sort(),
        'applies nested meta value'
      );
      done();
    });

    it('handles nested schemas', function (done) {
      const schema = {
        _type: 'map',
        _required: ['children'],
        children: {
          _type: 'map',
          _required: ['grandchildren'],
          grandchildren: {
            _type: 'map',
            _required: ['x', 'y'],
            x: v().string(),
            y: v().string()
          }
        }
      };
      const validate = create(schema);
      let output = validate({
        children: {
          grandchildren: {
            x: 100,
          }
        }
      });
      should.equal(output.errors.length, 2, 'validates grandchildren errors');
      should.deepEqual(
        output.errors.map((d) => d.message).sort(),
        ['Expected a string but got a number', 'y is required'].sort(),
        'validates grandchildren errors'
      );
      should.equal(output.data.children.grandchildren.x, 100, 'sets nested values');
      done();
    });
  });
});
