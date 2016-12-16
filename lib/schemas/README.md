## Schema format

A schema is a mapping of the various data properties we would expect in a model, along with validator functions for those properties and a handful of meta properties.

### Validation

We use [validimir](https://github.com/juliangruber/validimir) to validate data types and make assertions on them. Creating a validator function is easy:

```(javascript)
import v from 'validimir';
var validate = v().array().each(v().number());
validate([1, 2, 3]);
// { errors: [] }
```

### Meta properties

We define a handful of meta properties for features like required values, database hashkeys, and setting defaults.

```(javascript)
import v from 'validimir';
var schema = {
   _type: 'map',
   _hashkey: 'id',
   _required: ['id', 'name'],
   _defaults: {
      location: 'usa'
   },
   _meta: {
      foo: 'bar'
   },
   id: v().number(),
   name: v().string(),
   location: v().string()
};
```

#### `_type`

Specifies the kind of object this schema is. Only supports `map`. It needs to be included and makes it possible to nest schema objects (more on this below). It gives us future flexibility to create different data structures for schemas beyond just simple objects.

#### `_hashkey`

The property to use as the database hashkey. Currently there is no code that touches this, implementation is TBD, but it's good to include.

#### `_required`

A list of property names that, if not included in the raw data, will cause an `undefined` error to be appended to the `errors` array.

#### `_defaults`

A set of defaults that apply if no value is found in the raw data. This value can be a primtive or a function, ie:

```(javascript)
_defaults: {
   location: () => 'usa'
}
```

#### '_meta'

These data properties will be applied to the validated data after the validation step. This is a good place to stick a `thoroughput` property, for example. `_meta` properties only get added for the root level schema object, and will be ignored on nested objects.

### Nesting

To nest schema properties, just make sure to include a `_type: 'map'` property in the nested object, ie:

```(javascript)
var schema = {
   _type: 'map',
   id: v().string(),
   description: {
      _type: 'map',
      title: v().string(),
      body: v().string()
   },
};
```
