import { GraphQLCustomDirective, applySchemaCustomDirectives } from '../src/index';
import { GraphQLInt, GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLList, graphql } from 'graphql';
import { DirectiveLocation } from 'graphql/type/directives';
import { createGraphQLQueryDeepObject, testEqual, testNullEqual } from './utils';

import { expect } from 'chai';

let GraphQLTestDirective, schema;


describe('GraphQLCustomDirective', () => {

    before(() => {
        GraphQLTestDirective = new GraphQLCustomDirective({
            name: 'duplicate',
            description:
                'duplicate the string sperating them with space',
            locations: [
                DirectiveLocation.FIELD
            ],
            args: {
                by: {
                    type: GraphQLInt,
                    description: 'the times to duplicate the string'
                }
            },
            resolve: function(resolve, source, { by }) {
                return resolve().then(result => {

                    if (!result) {
                        return result;
                    }

                    let times = [];

                    for (let i = 0; i < (by || 2); i++) {
                        times.push(result);
                    }

                    return times.join(' ');
                });
            }
        });
    });

    it('expected to have name property', () => {
        expect(GraphQLTestDirective.name).to.eql('duplicate');
    });

    it('expected to have description property', () => {
        expect(GraphQLTestDirective.description).to.eql('duplicate the string sperating them with space');
    });

    it('expected to have args properties', () => {
        expect(GraphQLTestDirective.args).to.a('array');
    });

    it('expected to have locations list', () => {
        expect(GraphQLTestDirective.locations).to.a('array');
    });

    it('expected to have resolve function', () => {
        expect(GraphQLTestDirective.resolve).to.be.function;
    });


    it('expected regular execution of graphql', (done) => {
        const query = `{ input }`,
            expected = { "input": null };

        testNullEqual({ query, expected, done });
    });

    it('expected directive to alter execution of graphql and result test test', (done) => {
        const query = `{ input(value: "test") @duplicate }`,
            expected = { "input": "test test" };

        testEqual({ directive: GraphQLTestDirective, query, expected, done });
    });

    it('expected directive to alter execution of graphql and result test test', (done) => {
        const query = `{ input(value: "test") @duplicate @duplicate(by:3) }`,
            expected = { "input": "test test test test test test" };

        testEqual({ directive: GraphQLTestDirective, query, expected, done });
    });

    it('expected directive to alter execution of graphql and result null', (done) => {
        const query = `{ input @duplicate }`,
            expected = { "input": null };

        testEqual({ directive: GraphQLTestDirective, query, expected, done });
    });

});

describe('applySchemaCustomDirectives', () => {

    it('expected to throw error when invalid schema', () => {
        expect(applySchemaCustomDirectives.bind({})).throw(/Schema must be instanceof GraphQLSchema/);
    });

    it('expected to apply custom directives to schema', () => {
        let schema = new GraphQLSchema({
            query: createGraphQLQueryDeepObject()
        });

        expect(applySchemaCustomDirectives(schema)).to.eql(true);
    });
});
