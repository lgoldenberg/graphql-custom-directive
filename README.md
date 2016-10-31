# graphql-custom-directive
[![Build Status](https://travis-ci.org/lirown/graphql-custom-directive.svg?branch=master)](https://travis-ci.org/lirown/graphql-custom-directive)
[![Coverage Status](https://coveralls.io/repos/github/lirown/graphql-custom-directive/badge.svg?branch=master)](https://coveralls.io/github/lirown/graphql-custom-directive?branch=master)
[![npm version](https://badge.fury.io/js/graphql-custom-directive.svg)](https://badge.fury.io/js/graphql-custom-directive)
[![Dependency Status](https://david-dm.org/lirown/graphql-custom-directive.svg)](https://david-dm.org/lirown/graphql-custom-directive)
[![Known Vulnerabilities](https://snyk.io/test/github/lirown/graphql-custom-directive/badge.svg)](https://snyk.io/test/github/lirown/graphql-custom-directive)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

A custom directive for GraphQL with the ability to hook the query execution.

### Install
```
npm install --save graphql-custom-directive
```


### Usage
```javascript
import { GraphQLInt, GraphQLSchema, GraphQLObjectType, GraphQLNonNull, graphql } from 'graphql';
import { DirectiveLocation } from 'graphql/type/directives';
import { GraphQLCustomDirective, applySchemaCustomDirectives } from 'graphql-custom-directive';

const GraphQLCustomTestDirective = new GraphQLCustomDirective({
    name: 'duplicate',
    description:
        'duplicate the string sperating them with space',
    locations: [
        DirectiveLocation.FIELD
    ],
    args: {
        by: {
            type: new GraphQLNotNull(GraphQLInt),
            description: 'the times to duplicate the string'
        }
    },
    resolve: function(resolve, source, { by }, context, info) {
        return resolve().then(result => {      
            let times = [];
            
            for (let i = 0; i < by; i++) {
                times.push(result);
            }
            
            return times.join(' ');
        });
    }
})

const query = new GraphQLObjectType({
   name: 'Query',
   fields: {
       input: {
           type: GraphQLString,
           args: {
               value: {
                   type: GraphQLString
               }
           },
           resolve: (source, {value}) => value
       }
   }
});

const schema = new GraphQLSchema({
    directives: [
        GraphQLCustomTestDirective
    ],
    query
});

applySchemaCustomDirectives(schema);

graphql(schema, `{ input(value: "test") @duplicate(by:2) }`)
    .then(({ result, errors }) => {
       console.log(result); // will print { input: "test test" }
    });

```

### Options
```javascript
GraphQLCustomDirective({
    // name to be use in placing the directive [*required]
    name: String = 'test',
    
    // explain of the usage of the directive
    description: String = 'test',
    
    // areas in the query you can place the directive [*required]
    locations: [String] = [ DirectiveLocation.FIELD ],
    
    // object of passed variables from directive to resolve method
    args: Object = { as: { type: GraphQLInt, description: "foo bar" } } ),
    
    // method the hook the execution and transform the input to a new output  [*required]
    // arguments:
    // 1. resolve - a field promise that will result the output.
    // 2. args - a object of directive arguments defined in query exectution 
    // 3. source - a parent object of execution field result
    // 4. info - a collection of information about the current execution state
    resolve: Function = (resolve, arg, source, info) => resolve.then(input => input);
})

```
### License
```
The MIT License (MIT)

Copyright (c) 2016 Lirown

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
