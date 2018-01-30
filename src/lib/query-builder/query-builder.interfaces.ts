export interface IRule {
  nodeType?: string;
  condition?: string;
  rules?: IRule[];
  key?: string;
  field?: string;
  value?: any;
  operator?: string;
  not?: boolean;
  parent?: IRule;
}
export interface RuleSet extends IRule {

}

export interface Rule extends IRule {

}

export interface Option {
  name: string;
  value: any;
}

export interface Field {
  key?: string;
  name: string;
  type: string;
  nullable?: boolean;
  options?: Option[];
}

export interface QueryBuilderConfig {
  fields: { [key: string]: Field };
  allowEmptyRulesets?: boolean;
  getOperators?: (field: string) => string[];
  getInputType?: (field: string, operator: string) => string;
  getOptions?: (field: string) => Option[];
  addRuleSet?: (parent: RuleSet) => void;
  addRule?: (parent: RuleSet) => void;
  removeRuleSet?: (ruleset: RuleSet, parent: RuleSet) => void;
  removeRule?: (rule: Rule, parent: RuleSet) => void;
}
