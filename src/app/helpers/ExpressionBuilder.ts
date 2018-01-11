import { isFunction } from 'util';
import { ExpressionOperators } from './ExpressionOperators';

export class ExprressionBuilder {
    visitAndExpression(exprNode: Expression) {
        const conditions = exprNode.expressions.map(expr => this.lambdaExpression(expr));
        return it => conditions.every(c => c(it));
    }

    visitOrExpression(exprNode: Expression) {
        const conditions = exprNode.expressions.map(expr => this.lambdaExpression(expr));
        return it => conditions.some(c => c(it));
    }

    visitNotExpression(exprNode: Expression) {
        return it => {
            const condition = this.lambdaExpression(exprNode.rightExpression);
            return !condition(it);
        }
    }

    visitUnaryExpression(exprNode: Expression) {
        switch (exprNode.nodeType) {
            case 'and': return this.visitAndExpression(exprNode);
            case 'or': return this.visitOrExpression(exprNode);
            case 'not': return this.visitNotExpression(exprNode);
        }
    }

    visitBinaryExpression(exprNode: Expression) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.rightExpression);
        return it => this.operators[exprNode.nodeType](leftFunc(it), rightValue);
    }

    visitPropertyValueExpression(exprNode: Expression) {
        return it => isFunction(exprNode.value) ?
            exprNode.value(it) :
            this.resolveProperyValue(it, exprNode.property);
    }

    visitConstantExpression(exprNode: Expression) {
        return exprNode.value;
    }

    lambdaExpression(exprNode: Expression) {
        if (['not', 'and', 'or'].includes(exprNode.nodeType))
            return this.visitUnaryExpression(exprNode);
        else
            return this.visitBinaryExpression(exprNode);
    }
    operators = {
        eq: ExpressionOperators.equals,
        ne: ExpressionOperators.notEquals,
        lt: ExpressionOperators.lessThan,
        nlt: ExpressionOperators.notLessThan,
        lte: ExpressionOperators.lessThanOrEqual,
        nlte: ExpressionOperators.notLessThanOrEqual,
        gt: ExpressionOperators.greaterThan,
        ngt: ExpressionOperators.notGreaterThan,
        gte: ExpressionOperators.greaterThanOrEquals,
        ngte: ExpressionOperators.notGreaterThanOrEquals,
        like: ExpressionOperators.like,
        notlike: ExpressionOperators.notLike,
        contains: ExpressionOperators.contains,
        notcontains: ExpressionOperators.notContains,
        between: ExpressionOperators.between,
        notbetween: ExpressionOperators.notBetween,
        in: ExpressionOperators.in,
        notin: ExpressionOperators.notIn,
        startswith: ExpressionOperators.startsWith,
        notstartswith: ExpressionOperators.notStartsWith,
        endswith: ExpressionOperators.endsWith,
        notendswith: ExpressionOperators.notEndsWith,
        isnull: ExpressionOperators.isNull,
        isnotnull: ExpressionOperators.isNotNull,
        fuzzy: ExpressionOperators.fuzzy,
        notfuzzy: ExpressionOperators.notFuzzy
    }


    private resolveProperyValue(data, field: string) {
        if (data && field) {
            if (field.indexOf('.') == -1) {
                return data[field];
            }
            else {
                let fields: string[] = field.split('.');
                let value = data;
                for (var i = 0, len = fields.length; i < len; ++i) {
                    if (value == null) {
                        return null;
                    }
                    value = value[fields[i]];
                }
                return value;
            }
        }
        else {
            return null;
        }
    }
}

export function filter(source: any[], exprNode) {
    let exprBuilder = new ExprressionBuilder();
    const expr = exprBuilder.lambdaExpression(exprNode);
    return source.filter(expr);
}

const targetList = [
    { name: 'Bill', age: 30, gender: 'm' },
    { name: 'Anne', age: 28, gender: 'f' },
]

//表示 !(it.name === 'Bill') && it.gender === 'm'
export interface Expression {
    nodeType: string;
    property?: string;
    value?;
    rightExpression?: Expression;
    expressions?: Expression[];
}

const yourExpr: Expression = {
    nodeType: 'and',
    expressions: [
        {
            nodeType: 'not',
            rightExpression: {
                nodeType: 'eq',
                property: 'age',
                rightExpression: {
                    nodeType: 'constant',
                    value: 28
                }
            }
        },
        {
            nodeType: 'eq',
            property: 'gender',
            rightExpression: {
                nodeType: 'constant',
                value: 'm'
            }
        }
    ]
}

const expr2: Expression = {
    nodeType: 'and',
    expressions: [
        {
            nodeType: 'eq',
            property: 'age',
            rightExpression: {
                nodeType: 'constant',
                value: 28
            }
        },
        {
            nodeType: 'eq',
            property: 'gender',
            rightExpression: {
                nodeType: 'constant',
                value: 'f'
            }
        }
    ]
}

// const results = filter(targetList, yourExpr)
// console.log(results);

// and(not(eq("age", 28)), eq("gender", constant("m")))
