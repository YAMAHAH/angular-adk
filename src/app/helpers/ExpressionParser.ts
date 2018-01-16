export class ExpressionParser {
    /*global module: true, exports: true, console: true */

    // This is the full set of types that any JSEP node can be.
    // Store them here to save space when minified
    COMPOUND = 'Compound';
    IDENTIFIER = 'Identifier';
    MEMBER_EXP = 'MemberExpression';
    LITERAL = 'Literal';
    THIS_EXP = 'ThisExpression';
    CALL_EXP = 'CallExpression';
    UNARY_EXP = 'UnaryExpression';
    BINARY_EXP = 'BinaryExpression';
    LOGICAL_EXP = 'LogicalExpression';
    CONDITIONAL_EXP = 'ConditionalExpression';
    ARRAY_EXP = 'ArrayExpression';

    PERIOD_CODE = 46; // '.'
    COMMA_CODE = 44; // ','
    SQUOTE_CODE = 39; // single quote
    DQUOTE_CODE = 34; // double quotes
    OPAREN_CODE = 40; // (
    CPAREN_CODE = 41; // )
    OBRACK_CODE = 91; // [
    CBRACK_CODE = 93; // ]
    QUMARK_CODE = 63; // ?
    SEMCOL_CODE = 59; // ;
    COLON_CODE = 58; // :

    throwError(message, index) {
        let error: any = new Error(message + ' at character ' + index);
        error.index = index;
        error.description = message;
        throw error;
    }

    // Operations
    // ----------

    // Set `t` to `true` to save space (when minified, not gzipped)
    t = true;
    // Use a quickly-accessible map to store all of the unary operators
    // Values are set to `true` (it really doesn't matter)
    private unary_ops: { [key: string]: any } = { '-': this.t, '!': this.t, '~': this.t, '+': this.t };
    // Also use a map for the binary operations but set their values to their
    // binary precedence for quick reference:
    // see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
    private binary_ops: { [key: string]: any } = {
        '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5,
        '==': 6, '!=': 6, '===': 6, '!==': 6,
        '<': 7, '>': 7, '<=': 7, '>=': 7,
        '<<': 8, '>>': 8, '>>>': 8,
        '+': 9, '-': 9,
        '*': 10, '/': 10, '%': 10, '**': 10
    };
    // Get return the longest key length of any object
    getMaxKeyLen(obj) {
        let max_len = 0, len;
        for (let key in obj) {
            if ((len = key.length) > max_len && obj.hasOwnProperty(key)) {
                max_len = len;
            }
        }
        return max_len;
    }
    max_unop_len = this.getMaxKeyLen(this.unary_ops);
    max_binop_len = this.getMaxKeyLen(this.binary_ops)
    // Literals
    // ----------
    // Store the values to return for the various literals we may encounter
    literals: { [key: string]: any } = {
        'true': true,
        'false': false,
        'null': null
    };
    // Except for `this`, which is special. This could be changed to something like `'self'` as well
    this_str = 'this';
    // Returns the precedence of a binary operator or `0` if it isn't a binary operator
    binaryPrecedence(op_val) {
        return this.binary_ops[op_val] || 0;
    }
    // Utility function (gets called from multiple places)
    // Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
    createBinaryExpression(operator, left, right) {
        let type = (operator === '||' || operator === '&&') ? this.LOGICAL_EXP : this.BINARY_EXP;
        return {
            type: type,
            operator: operator,
            left: left,
            right: right
        };
    }
    // `ch` is a character code in the next three functions
    isDecimalDigit(ch) {
        return (ch >= 48 && ch <= 57); // 0...9
    }
    isIdentifierStart(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
            (ch >= 65 && ch <= 90) || // A...Z
            (ch >= 97 && ch <= 122) || // a...z
            (ch >= 128 && !this.binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
    }
    isIdentifierPart(ch) {
        return (ch === 36) || (ch === 95) || // `$` and `_`
            (ch >= 65 && ch <= 90) || // A...Z
            (ch >= 97 && ch <= 122) || // a...z
            (ch >= 48 && ch <= 57) || // 0...9
            (ch >= 128 && !this.binary_ops[String.fromCharCode(ch)]); // any non-ASCII that is not an operator
    }

    // Parsing
    // -------
    // `expr` is a string with the passed in expression
    parse(expr: string) {
        // `index` stores the character number we are currently at while `length` is a constant
        // All of the gobbles below will modify `index` as we move along
        let index = 0,
            charAtFunc = expr.charAt,
            charCodeAtFunc = expr.charCodeAt,
            exprI = i => { return charAtFunc.call(expr, i); },
            exprICode = i => { return charCodeAtFunc.call(expr, i); },
            length = expr.length,

            // Push `index` up to the next non-space character
            gobbleSpaces = () => {
                var ch = exprICode(index);
                // space or tab
                while (ch === 32 || ch === 9 || ch === 10 || ch === 13) {
                    ch = exprICode(++index);
                }
            },

            // The main parsing function. Much of this code is dedicated to ternary expressions
            gobbleExpression = () => {
                let test = gobbleBinaryExpression(),
                    consequent, alternate;
                gobbleSpaces();
                if (exprICode(index) === this.QUMARK_CODE) {
                    // Ternary expression: test ? consequent : alternate
                    index++;
                    consequent = gobbleExpression();
                    if (!consequent) {
                        this.throwError('Expected expression', index);
                    }
                    gobbleSpaces();
                    if (exprICode(index) === this.COLON_CODE) {
                        index++;
                        alternate = gobbleExpression();
                        if (!alternate) {
                            this.throwError('Expected expression', index);
                        }
                        return {
                            type: this.CONDITIONAL_EXP,
                            test: test,
                            consequent: consequent,
                            alternate: alternate
                        };
                    } else {
                        this.throwError('Expected :', index);
                    }
                } else {
                    return test;
                }
            },

            // Search for the operation portion of the string (e.g. `+`, `===`)
            // Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
            // and move down from 3 to 2 to 1 character until a matching binary operation is found
            // then, return that binary operation
            gobbleBinaryOp = () => {
                gobbleSpaces();
                let biop, to_check = expr.substr(index, this.max_binop_len), tc_len = to_check.length;
                while (tc_len > 0) {
                    if (this.binary_ops.hasOwnProperty(to_check)) {
                        index += tc_len;
                        return to_check;
                    }
                    to_check = to_check.substr(0, --tc_len);
                }
                return false;
            },

            // This function is responsible for gobbling an individual expression,
            // e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
            gobbleBinaryExpression = () => {
                let ch_i, node, biop, prec, stack: any[], biop_info, left, right, i;

                // First, try to get the leftmost thing
                // Then, check to see if there's a binary operator operating on that leftmost thing
                left = gobbleToken();
                biop = gobbleBinaryOp();

                // If there wasn't a binary operator, just return the leftmost node
                if (!biop) {
                    return left;
                }

                // Otherwise, we need to start a stack to properly place the binary operations in their
                // precedence structure
                biop_info = { value: biop, prec: this.binaryPrecedence(biop) };

                right = gobbleToken();
                if (!right) {
                    this.throwError("Expected expression after " + biop, index);
                }
                stack = [left, biop_info, right];

                // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
                while ((biop = gobbleBinaryOp())) {
                    prec = this.binaryPrecedence(biop);

                    if (prec === 0) {
                        break;
                    }
                    biop_info = { value: biop, prec: prec };

                    // Reduce: make a binary expression from the three topmost entries.
                    while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
                        right = stack.pop();
                        biop = stack.pop().value;
                        left = stack.pop();
                        node = this.createBinaryExpression(biop, left, right);
                        stack.push(node);
                    }

                    node = gobbleToken();
                    if (!node) {
                        this.throwError("Expected expression after " + biop, index);
                    }
                    stack.push(biop_info, node);
                }

                i = stack.length - 1;
                node = stack[i];
                while (i > 1) {
                    node = this.createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
                    i -= 2;
                }
                return node;
            },

            // An individual part of a binary expression:
            // e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
            gobbleToken = () => {
                let ch, to_check, tc_len;

                gobbleSpaces();
                ch = exprICode(index);

                if (this.isDecimalDigit(ch) || ch === this.PERIOD_CODE) {
                    // Char code 46 is a dot `.` which can start off a numeric literal
                    return gobbleNumericLiteral();
                } else if (ch === this.SQUOTE_CODE || ch === this.DQUOTE_CODE) {
                    // Single or double quotes
                    return gobbleStringLiteral();
                } else if (ch === this.OBRACK_CODE) {
                    return gobbleArray();
                } else {
                    to_check = expr.substr(index, this.max_unop_len);
                    tc_len = to_check.length;
                    while (tc_len > 0) {
                        if (this.unary_ops.hasOwnProperty(to_check)) {
                            index += tc_len;
                            return {
                                type: this.UNARY_EXP,
                                operator: to_check,
                                argument: gobbleToken(),
                                prefix: true
                            };
                        }
                        to_check = to_check.substr(0, --tc_len);
                    }

                    if (this.isIdentifierStart(ch) || ch === this.OPAREN_CODE) { // open parenthesis
                        // `foo`, `bar.baz`
                        return gobbleVariable();
                    }
                }

                return false;
            },
            // Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
            // keep track of everything in the numeric literal and then calling `parseFloat` on that string
            gobbleNumericLiteral = () => {
                let number = '', ch: string, chCode;
                while (this.isDecimalDigit(exprICode(index))) {
                    number += exprI(index++);
                }

                if (exprICode(index) === this.PERIOD_CODE) { // can start with a decimal marker
                    number += exprI(index++);

                    while (this.isDecimalDigit(exprICode(index))) {
                        number += exprI(index++);
                    }
                }

                ch = exprI(index);
                if (ch === 'e' || ch === 'E') { // exponent marker
                    number += exprI(index++);
                    ch = exprI(index);
                    if (ch === '+' || ch === '-') { // exponent sign
                        number += exprI(index++);
                    }
                    while (this.isDecimalDigit(exprICode(index))) { //exponent itself
                        number += exprI(index++);
                    }
                    if (!this.isDecimalDigit(exprICode(index - 1))) {
                        this.throwError('Expected exponent (' + number + exprI(index) + ')', index);
                    }
                }

                chCode = exprICode(index);
                // Check to make sure this isn't a variable name that start with a number (123abc)
                if (this.isIdentifierStart(chCode)) {
                    this.throwError('Variable names cannot start with a number (' +
                        number + exprI(index) + ')', index);
                } else if (chCode === this.PERIOD_CODE) {
                    this.throwError('Unexpected period', index);
                }

                return {
                    type: this.LITERAL,
                    value: parseFloat(number),
                    raw: number
                };
            },

            // Parses a string literal, staring with single or double quotes with basic support for escape codes
            // e.g. `"hello world"`, `'this is\nJSEP'`
            gobbleStringLiteral = () => {
                let str = '', quote = exprI(index++), closed = false, ch;

                while (index < length) {
                    ch = exprI(index++);
                    if (ch === quote) {
                        closed = true;
                        break;
                    } else if (ch === '\\') {
                        // Check for all of the common escape codes
                        ch = exprI(index++);
                        switch (ch) {
                            case 'n': str += '\n'; break;
                            case 'r': str += '\r'; break;
                            case 't': str += '\t'; break;
                            case 'b': str += '\b'; break;
                            case 'f': str += '\f'; break;
                            case 'v': str += '\x0B'; break;
                            default: str += ch;
                        }
                    } else {
                        str += ch;
                    }
                }

                if (!closed) {
                    this.throwError('Unclosed quote after "' + str + '"', index);
                }

                return {
                    type: this.LITERAL,
                    value: str,
                    raw: quote + str + quote
                };
            },

            // Gobbles only identifiers
            // e.g.: `foo`, `_value`, `$x1`
            // Also, this function checks if that identifier is a literal:
            // (e.g. `true`, `false`, `null`) or `this`
            gobbleIdentifier = () => {
                let ch = exprICode(index), start = index, identifier;

                if (this.isIdentifierStart(ch)) {
                    index++;
                } else {
                    this.throwError('Unexpected ' + exprI(index), index);
                }

                while (index < length) {
                    ch = exprICode(index);
                    if (this.isIdentifierPart(ch)) {
                        index++;
                    } else {
                        break;
                    }
                }
                identifier = expr.slice(start, index);

                if (this.literals.hasOwnProperty(identifier)) {
                    return {
                        type: this.LITERAL,
                        value: this.literals[identifier],
                        raw: identifier
                    };
                } else if (identifier === this.this_str) {
                    return { type: this.THIS_EXP };
                } else {
                    return {
                        type: this.IDENTIFIER,
                        name: identifier
                    };
                }
            },

            // Gobbles a list of arguments within the context of a function call
            // or array literal. This function also assumes that the opening character
            // `(` or `[` has already been gobbled, and gobbles expressions and commas
            // until the terminator character `)` or `]` is encountered.
            // e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
            gobbleArguments = (termination) => {
                let ch_i, args = [], node, closed = false;
                while (index < length) {
                    gobbleSpaces();
                    ch_i = exprICode(index);
                    if (ch_i === termination) { // done parsing
                        closed = true;
                        index++;
                        break;
                    } else if (ch_i === this.COMMA_CODE) { // between expressions
                        index++;
                    } else {
                        node = gobbleExpression();
                        if (!node || node.type === this.COMPOUND) {
                            this.throwError('Expected comma', index);
                        }
                        args.push(node);
                    }
                }
                if (!closed) {
                    this.throwError('Expected ' + String.fromCharCode(termination), index);
                }
                return args;
            },

            // Gobble a non-literal variable name. This variable name may include properties
            // e.g. `foo`, `bar.baz`, `foo['bar'].baz`
            // It also gobbles function calls:
            // e.g. `Math.acos(obj.angle)`
            gobbleVariable = () => {
                let ch_i, node;
                ch_i = exprICode(index);

                if (ch_i === this.OPAREN_CODE) {
                    node = gobbleGroup();
                } else {
                    node = gobbleIdentifier();
                }
                gobbleSpaces();
                ch_i = exprICode(index);
                while (ch_i === this.PERIOD_CODE || ch_i === this.OBRACK_CODE || ch_i === this.OPAREN_CODE) {
                    index++;
                    if (ch_i === this.PERIOD_CODE) {
                        gobbleSpaces();
                        node = {
                            type: this.MEMBER_EXP,
                            computed: false,
                            object: node,
                            property: gobbleIdentifier()
                        };
                    } else if (ch_i === this.OBRACK_CODE) {
                        node = {
                            type: this.MEMBER_EXP,
                            computed: true,
                            object: node,
                            property: gobbleExpression()
                        };
                        gobbleSpaces();
                        ch_i = exprICode(index);
                        if (ch_i !== this.CBRACK_CODE) {
                            this.throwError('Unclosed [', index);
                        }
                        index++;
                    } else if (ch_i === this.OPAREN_CODE) {
                        // A function call is being made; gobble all the arguments
                        node = {
                            type: this.CALL_EXP,
                            'arguments': gobbleArguments(this.CPAREN_CODE),
                            callee: node
                        };
                    }
                    gobbleSpaces();
                    ch_i = exprICode(index);
                }
                return node;
            },

            // Responsible for parsing a group of things within parentheses `()`
            // This function assumes that it needs to gobble the opening parenthesis
            // and then tries to gobble everything within that parenthesis, assuming
            // that the next thing it should see is the close parenthesis. If not,
            // then the expression probably doesn't have a `)`
            gobbleGroup = () => {
                index++;
                let node = gobbleExpression();
                gobbleSpaces();
                if (exprICode(index) === this.CPAREN_CODE) {
                    index++;
                    return node;
                } else {
                    this.throwError('Unclosed (', index);
                }
            },

            // Responsible for parsing Array literals `[1, 2, 3]`
            // This function assumes that it needs to gobble the opening bracket
            // and then tries to gobble the expressions as arguments.
            gobbleArray = () => {
                index++;
                return {
                    type: this.ARRAY_EXP,
                    elements: gobbleArguments(this.CBRACK_CODE)
                };
            },

            nodes = [], ch_i, node;

        while (index < length) {
            ch_i = exprICode(index);

            // Expressions can be separated by semicolons, commas, or just inferred without any
            // separators
            if (ch_i === this.SEMCOL_CODE || ch_i === this.COMMA_CODE) {
                index++; // ignore separators
            } else {
                // Try to gobble each expression individually
                if ((node = gobbleExpression())) {
                    nodes.push(node);
                    // If we weren't able to find a binary expression and are out of room, then
                    // the expression passed in probably has too much
                } else if (index < length) {
                    this.throwError('Unexpected "' + exprI(index) + '"', index);
                }
            }
        }

        // If there's only one expression just try returning the expression
        if (nodes.length === 1) {
            return this.root = nodes[0];
        } else {
            return this.root = {
                type: this.COMPOUND,
                body: nodes
            };
        }
    }
    root;
    toPostfixExpression() {
        if (!this.root) return [];
        return this.convertToPostfixExpression(this.root, null);
    }
    private convertToPostfixExpression(node, results) {
        if (!results) results = [];
        if (null == node) return [];
        node.left && this.convertToPostfixExpression(node.left, results);
        node.right && this.convertToPostfixExpression(node.right, results);
        node && results.push(node);
        return results;
    }
    toPrefixExpression() {
        if (!this.root) return [];
        return this.convertToPrefixExpression(this.root, null);
    }
    private convertToPrefixExpression(node, results) {
        if (!results) results = [];
        if (null == node) return [];
        node && results.push(node);
        node.left && this.convertToPrefixExpression(node.left, results);
        node.right && this.convertToPrefixExpression(node.right, results);
        return results;
    }
    // To be filled in by the template
    version = '<%= version %>';
    toString() { return 'JavaScript Expression Parser (JSEP) v' + this.version; };

    /**
     * @method jsep.addUnaryOp
     * @param {string} op_name The name of the unary op to add
     * @return jsep
     */
    addUnaryOp(op_name) {
        this.max_unop_len = Math.max(op_name.length, this.max_unop_len);
        this.unary_ops[op_name] = this.t;
        return this;
    }

    /**
     * @method jsep.addBinaryOp
     * @param {string} op_name The name of the binary op to add
     * @param {number} precedence The precedence of the binary op (can be a float)
     * @return jsep
     */
    addBinaryOp(op_name: string, precedence: number) {
        this.max_binop_len = Math.max(op_name.length, this.max_binop_len);
        this.binary_ops[op_name] = precedence;
        return this;
    }

    /**
     * @method jsep.addLiteral
     * @param {string} literal_name The name of the literal to add
     * @param {*} literal_value The value of the literal
     * @return jsep
     */
    addLiteral(literal_name: string, literal_value) {
        this.literals[literal_name] = literal_value;
        return this;
    }

    /**
     * @method jsep.removeUnaryOp
     * @param {string} op_name The name of the unary op to remove
     * @return jsep
     */
    removeUnaryOp(op_name) {
        delete this.unary_ops[op_name];
        if (op_name.length === this.max_unop_len) {
            this.max_unop_len = this.getMaxKeyLen(this.unary_ops);
        }
        return this;
    }

    /**
     * @method jsep.removeAllUnaryOps
     * @return jsep
     */
    removeAllUnaryOps() {
        this.unary_ops = {};
        this.max_unop_len = 0;
        return this;
    }

    /**
     * @method jsep.removeBinaryOp
     * @param {string} op_name The name of the binary op to remove
     * @return jsep
     */
    removeBinaryOp(op_name) {
        delete this.binary_ops[op_name];
        if (op_name.length === this.max_binop_len) {
            this.max_binop_len = this.getMaxKeyLen(this.binary_ops);
        }
        return this;
    }

    /**
     * @method jsep.removeAllBinaryOps
     * @return jsep
     */
    removeAllBinaryOps() {
        this.binary_ops = {};
        this.max_binop_len = 0;

        return this;
    }

    /**
     * @method jsep.removeLiteral
     * @param {string} literal_name The name of the literal to remove
     * @return jsep
     */
    removeLiteral(literal_name) {
        delete this.literals[literal_name];
        return this;
    }

    /**
     * @method jsep.removeAllLiterals
     * @return jsep
     */
    removeAllLiterals() {
        this.literals = {};
        return this;
    }

    // In desktop environments, have a way to restore the old value for `jsep`
    // 	if (typeof exports === 'undefined') {
    // 		var old_jsep = root.jsep;
    // 		// The star of the show! It's a function!
    // 		root.jsep = jsep;
    // 		// And a courteous function willing to move out of the way for other similarly-named objects!
    // 		jsep.noConflict = function() {
    // 			if(root.jsep === jsep) {
    // 				root.jsep = old_jsep;
    // 			}
    // 			return jsep;
    // 		};
    // 	} else {
    // 		// In Node.JS environments
    // 		if (typeof module !== 'undefined' && module.exports) {
    // 			exports = module.exports = jsep;
    // 		} else {
    // 			exports.parse = jsep;
    // 		}
    // 	}
    // }(this));
}

const exparessionParser = new ExpressionParser();

if (typeof window !== 'undefined') {
    window['expression'] = exparessionParser;
}
