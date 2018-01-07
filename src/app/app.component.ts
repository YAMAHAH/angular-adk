import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  test() {
    let filterFunc = this.genFilterExpression(null, null);
    let filterDatas = this.treeTableData.filter(value => {
      let result = filterFunc(value);
      console.log(result);
      return result;
    });
    console.log(filterDatas);
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
      field: "group1", value: "", operators: "none", concat: 'and', IsChildExpress: true,
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
        globalMatch = this.filterConstraints['contains'](this.resolveFieldData(value, col.name), filter);
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
  genFilterExpression(value, filter) {
    let root: FilterMetadata = { IsChildExpress: true };
    root.childs = this.filters;
    let notFilter: FilterMetadata = { IsChildExpress: true, invert: false };
    notFilter.childs = [root];
    this.RecursionGenerateExpression(value, notFilter);
    let rowFilterFunc = notFilter.Expression;
    console.log(rowFilterFunc.toString());
    let presetFilterFunc = (this.filterExpression ? this.parseFilter(this.filterExpression) : (value) => true);
    return (value) => presetFilterFunc(value) && rowFilterFunc(value) && this.keywordFilter(value, filter);
    // (value)=> ( (value)=>func1(value) && ( (value)=> (value)=>func2(value) || (value)=>func3(value) ))
  }
  private RecursionGenerateExpression(value, root: FilterMetadata) {
    //生成相应的表达式树
    if (!root.IsChildExpress) {
      if (root.IsSetNode && !root.IsCustomColumnFilter)
        this.RecursionGenerateListExpression(root);
      else
        this.GenerateExpression(value, root);
    }
    root.childs && root.childs.forEach(child => {
      if (!(child.IsSetNode && root.IsProcessDone)) {
        this.RecursionGenerateExpression(value, child);
        //拼接表达式树
        this.ConcatExpression(root, child,
          root.childs[0] == child,
          root.childs[root.childs.length - 1] == child);
      }
    });
  }
  RecursionGenerateListExpression(c) {

  }
  GenerateExpression(dataRow: ITreeTableRow, filterRequest: FilterMetadata) {
    let expr = null;
    if (filterRequest.IsCustomColumnFilter || filterRequest.IsSetOperation) {
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
    let filterValue = filterRequest.value,
      filterField = filterRequest.field,
      filterMatchMode = filterRequest.operators || 'startsWith';
    let filterConstraint = this.filterConstraints[filterMatchMode];
    filterRequest.Expression = (value) => {
      let dataFieldValue = this.resolveFieldData(value, filterField);
      return filterConstraint && filterConstraint(dataFieldValue, filterValue);
    }
  }
  ConcatExpression(root: FilterMetadata, child: FilterMetadata, first: boolean, last: boolean) {
    let childFunc: Function = child.Expression,
      func: Function = root.Expression;
    //let childFuncSecond, funcSecond;
    if (first) {
      if (child.invert)
        root.Expression = (value) => !childFunc(value);
      else
        root.Expression = value => childFunc(value);
      console.log(childFunc);
    }
    else if (child.concat == 'and' || child.concat == 'none' || !child.concat) {
      // funcSecond = func();
      if (child.invert)
        root.Expression = value => (func(value) && !childFunc(value));
      else
        root.Expression = value => (func(value) && childFunc(value));
      //console.log(funcSecond);
    }
    else if (child.concat == 'or') {
      // funcSecond = func();
      if (child.invert)
        root.Expression = value => (func(value) || !childFunc(value));
      else
        root.Expression = value => (func(value) || childFunc(value));
      //console.log(funcSecond);
    }
    if (last) {
      if (root.invert) {
        func = root.Expression;
        //funcSecond = func();
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

    startsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toLowerCase();
      return value.toString().toLowerCase().slice(0, filterValue.length) === filterValue;
    },

    contains(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    },

    endsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toString().toLowerCase();
      return value.toString().toLowerCase().indexOf(filterValue, value.toString().length - filterValue.length) !== -1;
    },

    equals(value, filter): boolean {
      if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase() == filter.toString().toLowerCase();
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
    }
  }
}

export interface FilterMetadata {
  id?: number;
  parentId?: number;
  field?: string;
  operators?: string;
  value?;
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