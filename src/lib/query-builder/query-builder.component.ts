import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Field, Option, QueryBuilderConfig, Rule, RuleSet, IRule } from './query-builder.interfaces';
import { DropEvent } from 'ng-drag-drop';

@Component({
  selector: 'query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit, OnChanges {
  public fieldNames: string[];

  @Input() operatorMap: { [key: string]: string[] };
  @Input() typeMap: { [key: string]: string };
  @Input() parentData: RuleSet;
  @Input() data: RuleSet = { condition: 'and', rules: [] };
  @Input() config: QueryBuilderConfig = { fields: {} };

  private defaultEmptyList: any[] = [];
  private operatorsCache: { [key: string]: string[] };

  constructor() {
    this.typeMap = {
      string: 'text',
      number: 'number',
      category: 'select',
      date: 'date',
      boolean: 'checkbox'
    };
    this.operatorMap = {
      string: ['eq', 'neq', 'gt', 'lt', 'startsWith', 'notStartsWith', 'endsWith', 'notEndsWith', 'like', 'notLike', 'between', 'notBetween'],
      number: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'notBetween'],
      category: ['eq', 'neq'],
      date: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'notBetween', 'sameWeek', 'sameMonth', 'sameYear'],
      boolean: ['eq']
    };
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const config = this.config;
    if (typeof config === 'object') {
      this.fieldNames = Object.keys(config.fields);
      this.operatorsCache = {};
    } else {
      throw new Error('config must be a valid object');
    }
  }

  getOperators(field: string): string[] {
    if (this.operatorsCache[field]) {
      return this.operatorsCache[field];
    }
    let operators = this.defaultEmptyList;
    if (this.config.getOperators) {
      operators = this.config.getOperators(field);
    }
    const fieldObject = this.config.fields[field];
    const type = fieldObject.type;
    if (field && this.operatorMap[type]) {
      operators = this.operatorMap[type];
    }
    if (fieldObject.options) {
      operators = operators.concat(['in', 'notIn']);
    }
    if (fieldObject.nullable) {
      operators = operators.concat(['isNull', 'isNotNull']);
    }
    // Cache reference to array object, so it won't be computed next time and trigger a rerender.
    this.operatorsCache[field] = operators;
    return operators;
  }

  getInputType(field: string, operator: string): string {
    if (this.config.getInputType) {
      return this.config.getInputType(field, operator);
    }
    const type = this.config.fields[field].type;
    switch (operator) {
      case 'isNull':
      case 'isNotNull':
        return null;  // No displayed component
      case 'in':
      case 'notIn':
        return 'multiselect';
      default:
        return this.typeMap[type];
    }
  }

  getOptions(field: string): Option[] {
    if (this.config.getOptions) {
      return this.config.getOptions(field);
    }
    return this.config.fields[field].options || this.defaultEmptyList;
  }
  notClick(event, data, notOption) {
    data.not = notOption.checked = !notOption.checked;
  }

  addRule(parent: RuleSet): void {
    if (this.config.addRule) {
      return this.config.addRule(parent);
    } else {
      const key = this.fieldNames[0];
      const fieldObject = this.config.fields[key];
      parent.rules = parent.rules.concat([
        {
          key: key,
          field: fieldObject.name,
          operator: this.operatorMap[fieldObject.type][0]
        }
      ]);
    }
  }

  removeRule(rule: Rule, parent: RuleSet): void {
    if (this.config.removeRule) {
      this.config.removeRule(rule, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== rule);
    }
  }

  addRuleSet(parent: RuleSet): void {
    if (this.config.addRuleSet) {
      this.config.addRuleSet(parent);
    } else {
      parent.rules = parent.rules.concat([{ condition: 'and', rules: [] }]);
    }
  }

  removeRuleSet(ruleset: RuleSet, parent: RuleSet): void {
    if (this.config.removeRuleSet) {
      this.config.removeRuleSet(ruleset, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== ruleset);
    }
  }

  onFieldChange(rule: Rule): void {
    delete rule.value;
    const fieldObject = this.config.fields[rule.key];
    rule.field = fieldObject.name;
    rule.operator = this.operatorMap[fieldObject.type][0];
  }

  //on rule: moveAfter
  //on group header:moveAtBegin
  //on group :moveAtEnd

  onDragStartHandler(event, item) {
  }

  onDragEndHandler(event, item, groupHeader: boolean) {
  }
  onDragOverHandler(event: DropEvent, item, groupHeader: boolean) {
    // event.nativeEvent.preventDefault();
    // event.nativeEvent.stopPropagation();
  }
  onDropHandler(event: DropEvent, dropObject) {
    event.nativeEvent.preventDefault();
    event.nativeEvent.stopPropagation();
    let dropWrapper: IDropObjectWrapper = dropObject;
    let dragWrapper: IDragObjectWrapper = event.dragData;

    if (dragWrapper.parent && dragWrapper.dragTarget != dropWrapper.dropTarget) {
      let dragRules = dragWrapper.parent.rules;
      let dragIdx = dragRules.findIndex(it => it == dragWrapper.dragTarget);
      if (dragIdx > -1) dragRules.splice(dragIdx, 1);

      let dropRules = dropWrapper.parent.rules;
      if (dropWrapper.groupHeader) {
        dropRules.unshift(dragWrapper.dragTarget);
      } else {
        let dropIdx = dropRules.findIndex(it => it == dropWrapper.dropTarget);
        if (dropIdx > -1) dropRules.splice(dropIdx + 1, 0, dragWrapper.dragTarget);
      }
    }
  }
}

interface IDragObjectWrapper {
  dragTarget: IRule;
  groupHeader: boolean;
  parent: IRule;
}

interface IDropObjectWrapper {
  dropTarget: IRule;
  groupHeader: boolean;
  parent: IRule;
}