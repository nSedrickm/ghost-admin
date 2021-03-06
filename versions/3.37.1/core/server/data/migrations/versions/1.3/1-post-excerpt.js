const Promise = require('bluebird');
const logging = require('../../../../../shared/logging');
const commands = require('../../../schema').commands;
const table = 'posts';
const columns = ['custom_excerpt'];
const _private = {};

_private.handle = function handle(options) {
    let type = options.type;
    let isAdding = type === 'Adding';
    let operation = isAdding ? commands.addColumn : commands.dropColumn;

    return function (opts) {
        let connection = opts.connection;

        return connection.schema.hasTable(table)
            .then(function (tableExists) {
                if (!tableExists) {
                    return Promise.reject(new Error('Table does not exist!'));
                }

                return Promise.each(columns, function (column) {
                    return connection.schema.hasColumn(table, column)
                        .then(function (columnExists) {
                            if (columnExists && isAdding || !columnExists && !isAdding) {
                                logging.warn(`${type} column ${table}.${column}`);
                                return Promise.resolve();
                            }

                            logging.info(`${type} column ${table}.${column}`);
                            return operation(table, column, connection);
                        });
                });
            });
    };
};

module.exports.up = _private.handle({type: 'Adding'});
module.exports.down = _private.handle({type: 'Dropping'});
