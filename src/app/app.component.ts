import { Component, OnDestroy } from '@angular/core';
import { JsUtils } from './helpers/JsUtils';
import { gt, gte, lt, lte, eq, isEmpty } from 'lodash';
import { FilterOperators } from './helpers/filterOperators';
import { ExprressionBuilder, ExpressionNode } from './helpers/ExpressionBuilder';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  ngOnDestroy(): void {

  }
  title = 'app';

  test2() {
    const exprNode: ExpressionNode = {
      node: 'and',
      expressions: [
        {
          node: 'like',
          property: 'gono',
          subExpression: {
            node: 'constant',
            value: 'P010102156'
          }
        },
        {
          node: 'lt',
          property: 'ord',
          subExpression: {
            node: 'constant',
            value: '11'
          }
        }
      ]
    }
    let exprBuilder = new ExprressionBuilder();
    const expr = exprBuilder.visitExpression(exprNode);
    let filterDatas = this.treeTableData.filter(expr);
    console.log(filterDatas);
  }

  test() {
    for (let i = 0; i < 100000; i++) {
      this.treeTableData.push(
        {
          id: 7, ord: 8, level: 2,
          gono: 'P010102156ZCEH',
          goname: '圆头⊕-JIS铁板牙A热(三价铬)',
          gg: 'M4-16*19MM蓝锌(环保)尖尾加硬38-42度.￠6.6',
          dw: 'PC', parentid: 6
        });
    }
    let startTime = new Date().getTime();
    let filterFunc = this.genFilterExpression(null);
    let strFilterFun = this.parseFilter("FilterOps.between(it.ord, [3, 5])");
    console.log(strFilterFun({ ord: 5 }));

    let customFilterFunc = it => this.filterConstraints.contains(it.gono, 'P010102156') &&
      (this.filterConstraints.contains(it.goname, '铁板牙') || this.filterConstraints.contains(it.goname, "圆头十字"))
      && this.filterConstraints.contains(it.goname, "铁板牙") || this.filterConstraints.startsWith(it.gono, "R001");
    let betweenFunc = it => FilterOperators.between(it.ord, [1, 12]);
    let filterDatas = this.treeTableData.filter(it => filterFunc(it) && betweenFunc(it));
    console.log(filterDatas);
    let runTime = new Date().getTime();
    console.log(runTime - startTime);

    JsUtils.debounce(() => console.log('debounce'), 300)();
    console.log('string', JsUtils.isString('mystr'));
    console.log('boolean', JsUtils.isBoolean(1));
    console.log('number', JsUtils.isNumber(123));
    console.log('date', JsUtils.isDate(new Date().getTime()));

    console.log('between', FilterOperators.between(789, [100, 1230]));
    console.log('notBetween', FilterOperators.notBetween(7890, [100, 1230]));
    console.log('like', this.filterConstraints.like(3568, 3));
    console.log('greatThan', this.filterConstraints.greaterThan(true, false));
    console.log('isEmpty', FilterOperators.isNull(void 0));

  }
  treeTableData: ITreeTableData[] = [
    { id: 1, ord: 1, level: 0, gono: 'B001-41AGAGF03', goname: '吊扇螺丝包', gg: 'A76彩+W44 环保蓝锌5F(PE袋不印字', dw: '包' },
    { id: 2, ord: 2, level: 1, gono: 'R001A765FZCE', goname: '叶架螺丝包', gg: '大扁M5*7MM*15支+纸M5.环保蓝锌', dw: '包', parentid: 1 },
    { id: 3, ord: 3, level: 2, gono: 'P010101053ZCE', goname: '大扁±(三价铬)', gg: 'M5-0.8*7MM蓝锌(环保).￠10', dw: 'PC', parentid: 2 },
    { id: 11, ord: 4, level: 3, gono: 'P010101053', goname: '大扁±', gg: 'M5-0.8*7MM黑身.￠10', dw: 'PC', parentid: 3 },
    { id: 4, ord: 5, level: 2, gono: 'P010300594SGE', goname: '圆纸华司', gg: '圆头M4*19MM*2￠5*14*1.5T 灰色(环保)', dw: 'PC', parentid: 2 },
    { id: 5, ord: 6, level: 2, gono: 'P560140065GRE', goname: '塑胶袋(全新料)', gg: '60*60*0.04MM(环保)浅绿色', dw: 'PC', parentid: 2 },
    { id: 6, ord: 7, level: 1, gono: 'R001W44ZCE', goname: '马达叶架螺丝包', gg: '圆头M4*19MM*2支.环保蓝锌', dw: '包', parentid: 1 },
    { id: 7, ord: 8, level: 2, gono: 'P010102156ZCEH', goname: '圆头⊕-JIS铁板牙A热(三价铬)', gg: 'M4-16*19MM蓝锌(环保)尖尾加硬38-42度.￠6.6', dw: 'PC', parentid: 6 },
    { id: 8, ord: 9, level: 3, gono: 'P010102156H', goname: '圆头⊕-JIS铁板牙A热', gg: 'M4-16*19MM黑身尖尾加硬38-42度.￠6.6', dw: 'PC', parentid: 7 },
    { id: 9, ord: 10, level: 4, gono: 'P010102156', goname: '圆头⊕-JIS铁板牙A', gg: 'M4-16*19MM黑身尖尾.￠6.6', dw: 'PC', parentid: 8 },
    { id: 10, ord: 11, level: 2, gono: 'P560140065GRE', goname: '塑胶袋(全新料)', gg: '60*60*0.04MM(环保)浅绿色', dw: 'PC', parentid: 6 },
    { id: 11, ord: 8, level: 1, gono: 'P560140004GRE', goname: '塑胶袋(全新料)', gg: '100*100*0.04MM(环保)浅绿色', dw: 'PC', parentid: 1 }
  ];
  filters: FilterMetadata[] = [
    { field: 'gono', value: 'P010102156', operators: 'contains' },
    {
      field: "childQuery", value: "", operators: "none", concat: 'and', IsChildExpress: true,
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
  ];;
  keywordFilter(value, filter) {
    let globalMatch = false;
    for (let j = 0; j < this.columns.length; j++) {
      let col = this.columns[j];
      if (filter && !globalMatch) {
        globalMatch = FilterOperators['contains'](this.resolveFieldData(value, col.name), filter);
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
    let notFilter: FilterMetadata = { IsChildExpress: true, invert: true };
    notFilter.childs = [root];
    let rootFilter: FilterMetadata = { IsChildExpress: true };
    rootFilter.childs = [notFilter, { field: 'ord', value: [2, 6], operators: 'between' }];
    this.RecursionGenerateExpression(notFilter);
    let rowFilterFunc = notFilter.Expression;
    let presetFilterFunc = (this.filterExpression ? this.parseFilter(this.filterExpression) : (value) => true);
    return it => presetFilterFunc(it) && rowFilterFunc(it) && this.keywordFilter(it, filter);
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
        //拼接表达式树 //42002
        // this.ConcatExpression(root, child,
        //   root.childs[0] == child,
        //   root.childs[root.childs.length - 1] == child);
      }
    });
    //root.childs && this.combineFilter2(root, root.childs); //24365
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
    let filterConstraint = FilterOperators[filterMatchMode];
    filterMeta.Expression = it => {
      let dataFieldValue = filterMeta.customValue ? filterMeta.customValue(it) : this.resolveFieldData(it, filterField);
      return filterConstraint && filterConstraint(dataFieldValue, filterValue);
    }
  }
  combineFilter<T>(rootFilter: FilterMetadata, childFilters: FilterMetadata[]) {
    let isFirst = true;
    for (let childFilter of childFilters) {
      let childFunc = childFilter.Expression;
      let func = rootFilter.Expression;
      if (isFirst) {
        if (childFilter.invert)
          rootFilter.Expression = value => !childFunc(value);
        else
          rootFilter.Expression = value => childFunc(value);
        isFirst = false;
      } else {
        if (childFilter.concat == 'or') {
          if (childFilter.invert)
            rootFilter.Expression = value => func(value) || !childFunc(value);
          else
            rootFilter.Expression = value => func(value) || childFunc(value);
        } else {
          if (childFilter.invert)
            rootFilter.Expression = value => func(value) && !childFunc(value);
          else
            rootFilter.Expression = value => func(value) && childFunc(value);
        }
      }
    }
    if (rootFilter.invert) {
      let func = rootFilter.Expression;
      rootFilter.Expression = value => !func(value);
    }
  }
  combineFilter2<T>(rootFilter: FilterMetadata, childFilters: FilterMetadata[]) {
    rootFilter.Expression = (value) => {
      let bResult = false;
      let isFirst = true;
      for (let childFilter of childFilters) {
        let childFunc = childFilter.Expression;
        if (isFirst) {
          if (childFilter.invert)
            bResult = !childFunc(value);
          else
            bResult = childFunc(value);
          isFirst = false;
        } else {
          if (childFilter.concat == 'or') {
            if (bResult) continue;
            if (childFilter.invert)
              bResult = bResult || !childFunc(value);
            else
              bResult = bResult || childFunc(value);
          } else {
            if (!bResult) continue;
            if (childFilter.invert)
              bResult = bResult && !childFunc(value);
            else
              bResult = bResult && childFunc(value);
          }
        }
      }
      if (rootFilter.invert) {
        bResult = !bResult;
      }
      return bResult;
    }
  }
  ConcatExpression(root: FilterMetadata, child: FilterMetadata, first: boolean, last: boolean) {
    let childFunc: Function = child.Expression,
      func: Function = root.Expression;
    if (first) {
      if (child.invert)
        root.Expression = (value) => !childFunc(value);
      else
        root.Expression = value => childFunc(value);
    }
    else if (child.concat == 'and' || child.concat == 'none' || !child.concat) {
      if (child.invert)
        root.Expression = value => func(value) && !childFunc(value);
      else
        root.Expression = value => func(value) && childFunc(value);
    }
    else if (child.concat == 'or') {
      if (child.invert)
        root.Expression = value => func(value) || !childFunc(value);
      else
        root.Expression = value => func(value) || childFunc(value);
    }
    if (last) {
      if (root.invert) {
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
  filterConstraints = {
    greaterThan(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return gt(value, filter);
    },
    notGreaterThan(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return !gt(value, filter);
    },
    greaterThanOrEquals(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      if (!(typeof value == 'string' && typeof filter == 'string')) {
        value = +value;
        filter = +filter;
      }
      return value >= filter;
    },
    notGreaterThanOrEquals(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      if (!(typeof value == 'string' && typeof filter == 'string')) {
        value = +value;
        filter = +filter;
      }
      return !(value >= filter);
    },
    lessThan(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return lt(value, filter);
    },
    notLessThan(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return !lt(value, filter);
    },
    lessThanOrEqual(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return lte(value, filter);
    },
    notLessThanOrEqual(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return !lte(value, filter);
    },
    like(value, filter) {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) !== -1;
    },
    notLike(value, filter) {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) === -1;
    },
    between(value, filter: any[]) {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }
      let [left, right] = filter;

      let filterValue = value.toString().toLowerCase();
      if (typeof left == 'string')
        left = left.toLowerCase();
      if (typeof right == 'string')
        right = right.toLowerCase();

      if (!right)
        return (filterValue >= left);
      else
        return (filterValue >= left) && (filterValue <= right);
    },
    notBetween(value, filter: any[]) {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }
      let [left, right] = filter;
      let filterValue = value.toString().toLowerCase();
      if (!right)
        return !(filterValue >= left);
      else
        return !((filterValue >= left) && (filterValue <= right));
    },
    /// <summary>
    /// （支持：1,2,3 或 1-3；如果不符合前面规则，即认为模糊查询
    /// </summary>
    fuzzy(value, fitler) { },

    notFuzzy(value, filter) { },

    regExp(value, filter) {
      return filter.test(value);
    },
    isNull(value) {

      if (value === undefined || value === null || value === '') {
        return true;
      }
      return false;
    },
    isNotNull(value) {
      if (value !== undefined || value !== null || value !== '') {
        return true;
      }
      return false;
    },
    startsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toLowerCase();
      return value.toString().toLowerCase().slice(0, filterValue.length) === filterValue;
    },
    notStartsWith(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toLowerCase();
      return value.toString().toLowerCase().slice(0, filterValue.length) !== filterValue;
    },

    contains(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) !== -1;
    },
    notContains(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) === -1;
    },
    endsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toString().toLowerCase();
      return value.toString().toLowerCase().indexOf(filterValue, value.toString().length - filterValue.length) !== -1;
    },
    notEndsWith(value, filter) {
      if (filter === undefined || filter === null || filter.toString().trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toString().toLowerCase();
      return value.toString().toLowerCase().indexOf(filterValue, value.toString().length - filterValue.length) === -1;
    },

    equals(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }
      // return value === other || (value !== value && other !== other)
      return value.toString().toLowerCase() == filter.toString().toLowerCase();
    },
    NotEquals(value, filter) {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase() != filter.toString().toLowerCase();
    },

    in(value, filter: any[]): boolean {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      for (let i = 0; i < filter.length; i++) {
        if (filter[i] === value)
          return true;
      }

      return false;
    },
    notIn(value, filter: any[]) {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return true;
      }
      for (let i = 0; i < filter.length; i++) {
        if (filter[i] === value)
          return false;
      }
      return true;
    }
  }
}





export interface FilterMetadata {
  field?: string;
  operators?: string;
  value?;
  customValue?: Function
  concat?: string;
  invert?: boolean;
  isGroup?: boolean;
  childs?: FilterMetadata[];
  IsChildExpress?: boolean;
  IsCustomColumnFilter?: boolean;
  IsSetNode?: boolean;
  IsProcessDone?: boolean;
  IsSetOperation?: boolean;
  Expression?;
  regExp?: RegExp
}

interface ITreeTableRow {
  rowNo?: number;
  collapsed?: boolean;
  visible?: boolean;
  level?: number;
  dataBoundItem?;
  cells?: ITreeTableRowCell[];
  table?;

}
interface ITreeTableRowCell {

  columnName?: string;
  columnIndex?: number;
  rowIndex?: number;
  readOnly?: boolean;
  value?;
  valueType?;
  style?;
  contentBounds?;
  formattedValue?;
  selected?: boolean;
  visible?: boolean;
  toolTipText?: string;
  tag?;
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
interface ITreeTableData {
  ord?;
  level?;
  gono?;
  goname?;
  gg?;
  dw?;
  parent?;
  id?;
  parentid?;
}

interface expression {
  nodeType: string;
  left?: string;
  right: expression;
  value?;
  childs: expression[];
}