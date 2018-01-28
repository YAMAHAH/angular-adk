import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Field, Option, QueryBuilderConfig, Rule, RuleSet } from './query-builder.interfaces';
import { DropEvent } from 'ng-drag-drop';
import { IRule } from './index';

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
      string: ['=', '!=', 'contains', 'like'],
      number: ['=', '!=', '>', '>=', '<', '<='],
      category: ['=', '!='],
      date: ['=', '!=', '>', '>=', '<', '<='],
      boolean: ['=']
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
      operators = operators.concat(['in', 'not in']);
    }
    if (fieldObject.nullable) {
      operators = operators.concat(['is null', 'is not null']);
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
      case 'is null':
      case 'is not null':
        return null;  // No displayed component
      case 'in':
      case 'not in':
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
      const field = this.fieldNames[0];
      const fieldObject = this.config.fields[field];
      parent.rules = parent.rules.concat([
        {
          field: field,
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
    const fieldObject = this.config.fields[rule.field];
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
    console.log(event);
  }
  onDropHandler(event: DropEvent, target, groupHeader: boolean) {
    event.nativeEvent.preventDefault();
    event.nativeEvent.stopPropagation();
    let dropWrapper = { dropTarget: target, groupHeader: groupHeader, parent: this.data };
    let dragWrapper: { dragTarget: IRule, groupHeader: boolean, parent: IRule } = event.dragData;
    // console.log(dragWrapper, dropWrapper);
    if (dragWrapper.parent && dragWrapper.dragTarget != dropWrapper.dropTarget) {
      let dragRules = dragWrapper.parent.rules;
      let dragIdx = dragRules.findIndex(it => it == dragWrapper.dragTarget);
      if (dragIdx > -1) dragRules.splice(dragIdx, 1);

      let dropRules = dropWrapper.parent.rules;
      if (dropWrapper.groupHeader) {
        dropRules.unshift(dragWrapper.dragTarget);
      } else {
        let targetIdx = dropRules.findIndex(it => it == target);
        if (targetIdx > -1) dropRules.splice(targetIdx + 1, 0, dragWrapper.dragTarget);
      }
    }
  }
}
