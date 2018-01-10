import { FilterOperators } from './filterOperators';
import { isFunction } from 'util';

export class ExprressionBuilder {
    visitAndExpression(exprNode: ExpressionNode) {
        const conditions = exprNode.expressions.map(expr => this.visitExpression(expr));
        return it => conditions.every(c => c(it));
    }

    visitOrExpression(exprNode: ExpressionNode) {
        const conditions = exprNode.expressions.map(expr => this.visitExpression(expr));
        return it => conditions.some(c => c(it));
    }

    visitNotExpression(exprNode: ExpressionNode) {
        return it => {
            const condition = this.visitExpression(exprNode.subExpression);
            return !condition(it);
        }
    }

    visitUnaryExpression(exprNode: ExpressionNode) {
        switch (exprNode.node) {
            case 'and': return this.visitAndExpression(exprNode);
            case 'or': return this.visitOrExpression(exprNode);
            case 'not': return this.visitNotExpression(exprNode);
            default: break;
        }
    }

    visitBinaryExpression(exprNode: ExpressionNode) {
        switch (exprNode.node) {
            case 'eq': return this.visitEqExpression(exprNode);
            case 'ne': return this.visitNeExpression(exprNode);
            case 'lt': return this.visitLtExpression(exprNode);
            case 'like': return this.visitLikeExpression(exprNode);
            case 'between': return this.visitBetweenExpression(exprNode);
            default: break;
        }
    }

    visitExpression(exprNode: ExpressionNode) {
        switch (exprNode.node) {
            case 'and': return this.visitUnaryExpression(exprNode);
            case 'or': return this.visitUnaryExpression(exprNode);
            case 'not': return this.visitUnaryExpression(exprNode);
            // case 'eq': return this.visitBinaryExpression(exprNode);
            // case 'ne': return this.visitBinaryExpression(exprNode);
            // case 'lt': return this.visitBinaryExpression(exprNode);
            // case 'like': return this.visitBinaryExpression(exprNode);
            // case 'between': return this.visitBinaryExpression(exprNode);
        }
        return this.visitNodeExpression(exprNode);
    }

    visitPropertyValueExpression(exprNode: ExpressionNode) {
        return it => isFunction(exprNode.value) ? exprNode.value(it) :
            this.resolveFieldData(it, exprNode.property);
    }

    visitEqExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression)
        return it => leftFunc(it) == rightValue;  //TODO 这里根据字符串或者数字分开处理
    }

    visitNeExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression);
        return it => leftFunc(it) != rightValue;
    }
    visitLtExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression);
        return it => leftFunc(it) < rightValue;
    }
    visitLikeExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression);
        return it => FilterOperators.contains(leftFunc(it), rightValue);
    }
    visitBetweenExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression);
        return it => FilterOperators.between(leftFunc(it), rightValue);
    }
    operators = {
        eq: FilterOperators.equals,
        ne: FilterOperators.notEquals,
        lt: FilterOperators.lessThan,
        nlt: FilterOperators.notLessThan,
        lte: FilterOperators.lessThanOrEqual,
        nlte: FilterOperators.notLessThanOrEqual,
        gt: FilterOperators.greaterThan,
        ngt: FilterOperators.notGreaterThan,
        gte: FilterOperators.greaterThanOrEquals,
        ngte: FilterOperators.notGreaterThanOrEquals,
        like: FilterOperators.contains,
        notlike: FilterOperators.notLike,
        between: FilterOperators.between,
        notbetween: FilterOperators.notBetween,
        in: FilterOperators.in,
        notin: FilterOperators.notIn,
        startswith: FilterOperators.startsWith,
        notstartswith: FilterOperators.notStartsWith,
        endswith: FilterOperators.endsWith,
        notendswith: FilterOperators.notEndsWith,
        isnull: FilterOperators.isNull,
        isnotnull: FilterOperators.isNotNull
    }
    visitNodeExpression(exprNode: ExpressionNode) {
        let leftFunc = this.visitPropertyValueExpression(exprNode);
        let rightValue = this.visitConstantExpression(exprNode.subExpression);
        return it => this.operators[exprNode.node](leftFunc(it), rightValue);
    }


    visitConstantExpression(exprNode: ExpressionNode) {
        return exprNode.value;
    }
    private resolveFieldData(data, field: string) {
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
    const expr = exprBuilder.visitExpression(exprNode);
    return source.filter(expr);
}

const targetList = [
    { name: 'Bill', age: 30, gender: 'm' },
    { name: 'Anne', age: 28, gender: 'f' },
]

//表示 !(it.name === 'Bill') && it.gender === 'm'
export interface ExpressionNode {
    node: string;
    property?: string;
    value?;
    subExpression?: ExpressionNode;
    expressions?: ExpressionNode[];
}
export interface UnaryNode extends ExpressionNode {

}
export interface BinaryNode extends ExpressionNode {

}


const yourExpr: ExpressionNode = {
    node: 'and',
    expressions: [
        {
            node: 'not',
            subExpression: {
                node: 'eq',
                property: 'age',
                subExpression: {
                    node: 'constant',
                    value: 28
                }
            }
        },
        {
            node: 'eq',
            property: 'gender',
            subExpression: {
                node: 'constant',
                value: 'm'
            }
        }
    ]
}

const expr2: ExpressionNode = {
    node: 'and',
    expressions: [
        {
            node: 'eq',
            property: 'age',
            subExpression: {
                node: 'constant',
                value: 28
            }
        },
        {
            node: 'eq',
            property: 'gender',
            subExpression: {
                node: 'constant',
                value: 'f'
            }
        }
    ]
}

const results = filter(targetList, yourExpr)
console.log(results);

// and(not(eq("age", 28)), eq("gender", constant("m")))