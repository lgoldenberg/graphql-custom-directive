import { GraphQLDirective } from 'graphql/type/directives';
import { GraphQLSchema } from 'graphql';

const DEFAULT_DIRECTIVES = ['skip', 'include'];

/**
 * If a resolve function is not given, then a default resolve behavior is used
 * which takes the property of the source object of the same name as the field
 * and returns it as the result, or if it's a function, returns the result
 * of calling that function.
 */
function defaultResolveFn(source, args, context, info) {
    var fieldName = info.fieldName;
    // ensure source is a value for which property access is acceptable.
    if (typeof source === 'object' || typeof source === 'function') {
        return typeof source[fieldName] === 'function' ? source[fieldName]() : source[fieldName];
    }
}

/**
 * resolving field using directive resolver
 */
const resolveWithDirective = function(resolve, source, directive, context, info) {
    let directiveConfig = info.schema._directives.filter(d => directive.name.value === d.name)[0];

    let args = {};

    for (let arg of directive.arguments) {
        args[arg.name.value] = arg.value.value;
    }

    return directiveConfig.resolve(resolve, source, args, context, info);
};

/**
 * If the directive is defined on a field it will execute the custom directive
 * resolve right after executing the resolve of the field otherwise it will execute
 * the original resolve of the field
 */
const resolveMiddlewareWrapper = function(resolve = defaultResolveFn) {
    return (source, args, context, info) => {
        const directives = info.fieldASTs[0].directives;
        const directive = directives.filter(d => DEFAULT_DIRECTIVES.indexOf(d.name.value) === -1)[0];

        if (!directive) {
            return resolve(source, args, context, info);
        }

        let defer = resolveWithDirective(() => Promise.resolve(resolve(source, args, context, info)), source, directive, context, info);

        if (directives.length <= 1) {
            return defer;
        }

        for (let directiveNext of directives.slice(1)) {
            defer = defer.then(result => resolveWithDirective(() => Promise.resolve(result), source, directiveNext, context, info));
        }

        return defer;
    };
};

/**
 * Scanning the shema and wrapping the resolve of each field with the support
 * of the graphql custom directives resolve execution
 */
function wrapFieldsWithMiddleware(fields) {
    for (let label in fields) {
        let field = fields.hasOwnProperty(label) ? fields[label] : null;

        if (!!field && typeof field == 'object') {
            field.resolve = resolveMiddlewareWrapper(field.resolve);
            if (field.type._fields) {
                wrapFieldsWithMiddleware(field.type._fields)
            } else if (field.type.ofType && field.type.ofType._fields) {
                wrapFieldsWithMiddleware(field.type.ofType._fields);
            }
        }
    }
}

/**
 * create a new graphql custom directive which contain a resolve
 * function for altering the execution of the graphql
 */
exports.GraphQLCustomDirective = function(config) {
    const directive = new GraphQLDirective(config);

    if (config.resolve) {
        directive.resolve = config.resolve;
    }

    return directive;
};

/**
 * Apply custom directives support in the graphql schema
 */
exports.applySchemaCustomDirectives = function(schema) {

    if (!(schema instanceof GraphQLSchema)) {
        throw new Error('Schema must be instanceof GraphQLSchema');
    }

    wrapFieldsWithMiddleware(schema._queryType._fields);

    return true;
};
