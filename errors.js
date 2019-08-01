const {
    ValidationError,
    NotFoundError
} = require('objection');

const {
    DBError,
    UniqueViolationError,
    NotNullViolationError,
    ForeignKeyViolationError,
    CheckViolationError,
    DataError
} = require('objection-db-errors');

// In this example `res` is an express response object.
function errorHandler(err, res) {
    if (err instanceof ValidationError) {
        switch (err.type) {
            case 'ModelValidation':
                res.status(400).send({
                    type: err.type,
                    data: err.data
                });
                break;
            case 'RelationExpression':
                res.status(400).send({
                    type: 'RelationExpression',
                    data: {}
                });
                break;
            case 'UnallowedRelation':
                res.status(400).send({
                    type: err.type,
                    data: {}
                });
                break;
            case 'InvalidGraph':
                res.status(400).send({
                    type: err.type,
                    data: {}
                });
                break;
            default:
                res.status(400).send({
                    type: 'UnknownValidationError',
                    data: {}
                });
                break;
        }
    } else if (err instanceof NotFoundError) {
        res.status(404).send({
            type: 'NotFound',
            data: {}
        });
    } else if (err instanceof UniqueViolationError) {
        res.status(409).send({
            type: 'UniqueViolation',
            data: {
                columns: err.columns,
                table: err.table,
                constraint: err.constraint
            }
        });
    } else if (err instanceof NotNullViolationError) {
        res.status(400).send({
            type: 'NotNullViolation',
            data: {
                column: err.column,
                table: err.table,
            }
        });
    } else if (err instanceof ForeignKeyViolationError) {
        res.status(409).send({
            type: 'ForeignKeyViolation',
            data: {
                table: err.table,
                constraint: err.constraint
            }
        });
    } else if (err instanceof CheckViolationError) {
        res.status(400).send({
            type: 'CheckViolation',
            data: {
                table: err.table,
                constraint: err.constraint
            }
        });
    } else if (err instanceof DataError) {
        res.status(400).send({
            type: 'InvalidData',
            data: {}
        });
    } else if (err instanceof DBError) {
        res.status(500).send({
            type: 'UnknownDatabaseError',
            data: {}
        });
    } else {
        res.status(500).send({
            type: 'UnknownError',
            data: {}
        });
    }
}

module.exports = errorHandler;