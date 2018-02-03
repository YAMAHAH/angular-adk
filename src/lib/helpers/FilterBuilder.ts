import { ExpressionOperators } from "./ExpressionOperators";
import { Expression } from "./ExpressionBuilder";

export class TableColumnFilterBuilder {
    filters: FilterMetadata[] = [
        { field: 'gono', value: 'P010102156', operators: 'contains' },
        {
            concat: 'and', IsChildExpress: true, not: true,
            childs: [
                { field: 'goname', value: '铁板牙', operators: 'contains', concat: 'none' },
                { field: 'goname', value: '圆头十字', operators: 'contains', concat: 'or' }
            ]
        },
        { field: 'goname', value: '铁板牙', operators: 'contains', concat: 'and' },

        { field: 'gono', value: 'R001', operators: 'startsWith', concat: 'or' }
    ];

    filterExpression: string = " true || it.gono.startsWith('P010102156') || it.gono.startsWith('R001W44ZCE')";
    columns: ITreeTableColumn[] = [
        {
            name: 'rowHeader', title: '', width: 25,
            resizable: false,
            expressionFunc: (row, index) => index + 1,
            defaultCellStyle: {
                'justify-content': 'center',
                'background-color': '#f3f3f3'
            }
        },
        { name: 'gono', title: '编码', width: 200 },
        { name: 'goname', title: '名称', width: 200 },
        { name: 'gg', title: '规格' },
        { name: 'dw', title: '单位', width: 65, defaultCellStyle: { 'justify-content': 'center' } },
        { name: 'level', title: '层次', width: 65, defaultCellStyle: { 'justify-content': 'center' } },
        { name: 'ord', title: '序号', width: 65, defaultCellStyle: { 'justify-content': 'center' } },
    ];
    keywordFilter(value, filter) {
        let globalMatch = false;
        for (let j = 0; j < this.columns.length; j++) {
            let col = this.columns[j];
            if (filter && !globalMatch) {
                globalMatch = ExpressionOperators['contains'](this.resolveFieldData(value, col.name), filter);
            }
        }
        if (filter) {
            return globalMatch;
        }
        return true;
    }

    parseFilter(filterStr: string) {
        return new Function('it', 'return (' + filterStr + ');');
    }
    genFilterExpression(filter) {
        let root: FilterMetadata = { IsChildExpress: true };
        root.childs = this.filters;
        this.RecursionGenerateExpression(root);
        let rowFilterFunc = root.Expression;
        let presetFilterFunc = (this.filterExpression ? this.parseFilter(this.filterExpression) : (it) => true);
        return it => presetFilterFunc(it) && rowFilterFunc(it) && this.keywordFilter(it, filter);
    }
    logicPriority = { not: 3, and: 2, or: 1 };
    private filterMetaConvertToExpressionTree(filterMetas: FilterMetadata[], allowMerge: boolean = true,
        root: Expression = null, parentLogicNode: Expression = null) {
        let firstFilterMeta = filterMetas[0];
        let reverseMetas = filterMetas;
        let prevLogicNode: Expression = parentLogicNode;
        while (reverseMetas.length > 0) {
            let nextFilterMeta = reverseMetas.pop();
            let nextLogicNode: Expression, nextOperatorNode: Expression, notNode: Expression;
            let isFirstExpr = (firstFilterMeta == nextFilterMeta);
            let isExistedLogic = allowMerge && !nextFilterMeta.IsChildExpress &&
                prevLogicNode && nextFilterMeta.concat == prevLogicNode.nodeType;

            if (nextFilterMeta.not) {
                notNode = {
                    nodeType: 'not',
                    priority: this.logicPriority['not'],
                    rightExpression: null
                };
            }
            if (isFirstExpr || isExistedLogic)
                nextLogicNode = null;
            else {
                let ndType = (nextFilterMeta.concat == undefined || nextFilterMeta.concat == 'none') ? 'and' : nextFilterMeta.concat;
                nextLogicNode = { //逻辑结点
                    nodeType: ndType,
                    expressions: [],
                    priority: this.logicPriority[ndType]
                };
                if (!root) { root = nextFilterMeta.not ? notNode : nextLogicNode; }
            }
            if (!nextFilterMeta.IsChildExpress) {//非虚拟结点时创建操作结点
                nextOperatorNode = {
                    nodeType: nextFilterMeta.operators,
                    property: nextFilterMeta.field,
                    expressions: [],
                    rightExpression: {
                        nodeType: 'constant',
                        value: nextFilterMeta.value
                    }
                };
            }
            if (nextLogicNode) {
                if (nextOperatorNode) {
                    if (notNode) {
                        notNode.rightExpression = nextOperatorNode;
                        nextLogicNode.expressions.unshift(notNode);
                    } else
                        nextLogicNode.expressions.unshift(nextOperatorNode);
                }
            }

            let isChildExpAndNot = nextFilterMeta.not && nextFilterMeta.IsChildExpress;
            if (prevLogicNode) {
                if (nextLogicNode) {
                    if (prevLogicNode.nodeType == 'not')
                        prevLogicNode.rightExpression = nextLogicNode;
                    else if (isChildExpAndNot) {
                        notNode.rightExpression = nextLogicNode;
                        prevLogicNode.expressions.unshift(notNode);
                    } else
                        prevLogicNode.expressions.unshift(nextLogicNode);

                } else if (nextOperatorNode) {
                    let nextOpNode;
                    if (notNode) {
                        notNode.rightExpression = nextOperatorNode;
                        nextOpNode = notNode;
                    } else {
                        nextOpNode = nextOperatorNode;
                    }
                    if (prevLogicNode.nodeType == 'not')
                        prevLogicNode.rightExpression = nextOpNode;
                    else
                        prevLogicNode.expressions.unshift(nextOpNode);

                } else if (isChildExpAndNot) {
                    if (prevLogicNode.nodeType == 'not')
                        prevLogicNode.rightExpression = notNode;
                    else
                        prevLogicNode.expressions.unshift(notNode);
                }

            }

            if (nextLogicNode) {
                if (!isChildExpAndNot)
                    prevLogicNode = nextLogicNode;
            } else if (isChildExpAndNot)
                prevLogicNode = notNode;

            if (nextFilterMeta.childs && nextFilterMeta.childs.length > 0)
                this.filterMetaConvertToExpressionTree(nextFilterMeta.childs, allowMerge, root,
                    isChildExpAndNot ? notNode : prevLogicNode);
        }
        if (root.expressions.length > 1)
            return root;
        else
            root.expressions[0];
    }
    private RecursionGenerateExpression(root: FilterMetadata) {
        //生成相应的表达式树
        if (!root.IsChildExpress) {
            if (root.IsSetNode && !root.IsCustomColumnFilter)
                this.RecursionGenerateListExpression(root);
            else
                this.GenerateExpression(root);
        }
        root.childs && root.childs.forEach(child => {
            if (!(child.IsSetNode && root.IsProcessDone)) {
                this.RecursionGenerateExpression(child);
            }
            //拼接表达式树
            // this.ConcatExpression(root, child, root.childs[0] == child, root.childs[root.childs.length - 1] == child);
        });
        root.childs && this.combineFilter(root, root.childs); //43767
    }
    RecursionGenerateListExpression(c) {

    }
    GenerateExpression(filterMeta: FilterMetadata) {
        let expr = null;
        if (filterMeta.IsCustomColumnFilter || filterMeta.IsSetOperation) {
            // var leftParamExpr = this.Parameters[0];
            // var rightParamExpr = filterRequest.SrcExpression.Parameters[0];
            // var visitor = new ReplaceExpressionVisitor(rightParamExpr, leftParamExpr);
            // var rightBodyExpr = visitor.Visit(filterRequest.SrcExpression.Body);
            // filterRequest.Expression = rightBodyExpr;
            return;
        }
        //if (filterRequest.PropClassify == PropClassify.List)
        //{
        //    return;
        //}
        //根据操作符生成相应的表达式
        let filterValue = filterMeta.value,
            filterField = filterMeta.field,
            filterMatchMode = filterMeta.operators || 'startsWith';
        let filterConstraint = ExpressionOperators[filterMatchMode];
        filterMeta.Expression = it => {
            let dataFieldValue = filterMeta.customValue ? filterMeta.customValue(it) :
                this.resolveFieldData(it, filterField);
            return filterConstraint && filterConstraint(dataFieldValue, filterValue);
        }
    }
    combineFilter<T>(rootFilter: FilterMetadata, childFilters: FilterMetadata[]) {
        let isFirst = true;
        for (let childFilter of childFilters) {
            let childFunc = childFilter.Expression;
            let func = rootFilter.Expression;
            if (isFirst) {
                if (childFilter.not)
                    rootFilter.Expression = value => !childFunc(value);
                else
                    rootFilter.Expression = value => childFunc(value);
                isFirst = false;
            } else {
                if (childFilter.concat == 'or') {
                    if (childFilter.not)
                        rootFilter.Expression = value => func(value) || !childFunc(value);
                    else
                        rootFilter.Expression = value => func(value) || childFunc(value);
                } else {
                    if (childFilter.not)
                        rootFilter.Expression = value => func(value) && !childFunc(value);
                    else
                        rootFilter.Expression = value => func(value) && childFunc(value);
                }
            }
        }
        if (rootFilter.not) {
            let func = rootFilter.Expression;
            rootFilter.Expression = value => !func(value);
        }
    }
    ConcatExpression(root: FilterMetadata, child: FilterMetadata, first: boolean, last: boolean) {
        let childFunc: Function = child.Expression,
            func: Function = root.Expression;
        if (first) {
            if (child.not)
                root.Expression = (value) => !childFunc(value);
            else
                root.Expression = value => childFunc(value);
        }
        else if (child.concat == 'and' || child.concat == 'none' || !child.concat) {
            if (child.not)
                root.Expression = value => func(value) && !childFunc(value);
            else
                root.Expression = value => func(value) && childFunc(value);
        }
        else if (child.concat == 'or') {
            if (child.not)
                root.Expression = value => func(value) || !childFunc(value);
            else
                root.Expression = value => func(value) || childFunc(value);
        }
        if (last) {
            if (root.not) {
                func = root.Expression;
                root.Expression = value => !func(value);
            }
        }
    }
    resolveFieldData(data, field: string) {
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

export interface FilterMetadata {
    field?: string;
    operators?: string;
    value?;
    customValue?: Function;
    concat?: string;
    not?: boolean;
    invert?: boolean;
    isGroup?: boolean;
    childs?: FilterMetadata[];
    IsChildExpress?: boolean;
    IsCustomColumnFilter?: boolean;
    IsSetNode?: boolean;
    IsProcessDone?: boolean;
    IsSetOperation?: boolean;
    Expression?;
    regExp?: RegExp;
    left?: number;
    right?: number;
}
export interface ITreeTableColumn {
    name: string;
    dataType?: string;
    title: string;
    defaultValue?: any;
    readOnly?: boolean;
    visible?: boolean;
    resizable?: boolean;
    sortable?: boolean;
    draggable?: boolean;
    selected?: boolean;
    allowNull?: boolean;
    order?: number;
    width?;
    minWidth?;
    algin?; // 水平 垂直
    defaultCellStyle?;
    headerCellStyle?;
    headerText?;
    expressionFunc?: (row, index) => any;

}