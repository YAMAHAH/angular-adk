import { gt, gte, lt, lte, eq, isUndefined, isNull } from 'lodash';

export class ExpressionOperators {
    static greaterThan(value, filter) {
        if (isUndefined(filter) || isNull(filter) || filter.toString().trim() === '') {
            return true;
        }
        if (isUndefined(value) || isNull(value)) {
            return false;
        }
        return gt(value, filter);
    }
    static notGreaterThan(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return !gt(value, filter);
    }
    static greaterThanOrEquals(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return gte(value, filter);
    }
    static notGreaterThanOrEquals(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return !gte(value, filter);
    }
    static lessThan(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return lt(value, filter);
    }
    static notLessThan(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return !lt(value, filter);
    }
    static lessThanOrEqual(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return lte(value, filter);
    }
    static notLessThanOrEqual(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        return !lte(value, filter);
    }
    static like(value, filter) {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) !== -1;
    }
    static notLike(value, filter) {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) === -1;
    }
    static between(value, filter: any[]) {
        if (filter === undefined || filter === null || filter.length === 0) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }
        let [left, right] = filter;
        if (!(typeof value == 'string' && typeof left == 'string')) {
            value = +value;
            left = +left;
            if (isUndefined(right))
                right = Number.MAX_VALUE;
            else
                right = +right;
            return (value >= left) && (value <= right);
        }
        let filterValue = value.toString().toLowerCase();
        if (!right)
            return (filterValue >= left);
        else
            return (filterValue >= left) && (filterValue <= right);
    }
    static notBetween(value, filter: any[]) {
        return !ExpressionOperators.between(value, filter);
    }
    /// <summary>
    /// （支持：1,2,3 或 1-3；如果不符合前面规则，即认为模糊查询
    /// </summary>
    static fuzzy(value, filter: string) {
        if (filter === undefined || filter === null || filter.length === 0) {
            return true;
        }
        if (value === undefined || value === null) {
            return false;
        }
        filter = filter.trim();
        let valueList: string[] = [];
        let splits: string[] = filter.split(',');
        if (splits.length > 1) {
            splits.forEach(v => {
                let val = v.trim();
                if (val.length > 0) {
                    valueList.push(val);
                }
            });
            return ExpressionOperators.in(value, valueList);
        }

        let index_minus = filter.indexOf('-');
        if (index_minus > 0 && index_minus < filter.length - 1) {
            let left = filter.substr(0, index_minus).trim();
            let right = filter.substr(index_minus + 1).trim();
            return ExpressionOperators.between(value, [left, right]);
        }

        return ExpressionOperators.like(value, filter);
    }

    static notFuzzy(value, filter) {
        return !ExpressionOperators.fuzzy(value, filter);
    }

    static regExp(value, filter) {
        return filter.test(value);
    }
    static isNull(value) {
        if (value === undefined || value === null || value === '') {
            return true;
        }
        return !value;
    }
    static isNotNull(value) {
        if (value !== undefined || value !== null || value !== '') {
            return true;
        }
        return false;
    }
    static startsWith(value, filter): boolean {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        let filterValue = filter.toLowerCase();
        return value.toString().toLowerCase().slice(0, filterValue.length) === filterValue;
    }
    static notStartsWith(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        let filterValue = filter.toLowerCase();
        return value.toString().toLowerCase().slice(0, filterValue.length) !== filterValue;
    }

    static contains(value, filter): boolean {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) !== -1;
    }
    static notContains(value, filter): boolean {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase().indexOf(filter.toString().toLowerCase()) === -1;
    }
    static endsWith(value, filter): boolean {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        let filterValue = filter.toString().toLowerCase();
        return value.toString().toLowerCase().indexOf(filterValue, value.toString().length - filterValue.length) !== -1;
    }
    static notEndsWith(value, filter) {
        if (filter === undefined || filter === null || filter.toString().trim() === '') {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        let filterValue = filter.toString().toLowerCase();
        return value.toString().toLowerCase().indexOf(filterValue, value.toString().length - filterValue.length) === -1;
    }

    static equals(value, filter): boolean {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase() == filter.toString().toLowerCase();
    }
    static notEquals(value, filter) {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.toString().trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value.toString().toLowerCase() != filter.toString().toLowerCase();
    }

    static in(value, filter: any[]): boolean {
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
    static notIn(value, filter: any[]) {
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

window['FilterOps'] = ExpressionOperators;