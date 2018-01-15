import { TreeNode } from '../models/TreeNode';
import { SwitchView } from '@angular/common/src/directives/ng_switch';

export class TreeUtils {
    static levelTraversalTree(root: TreeNode,
        action: (treeNode: TreeNode) => void = node => { },
        includeRoot: boolean = true) {
        let childs = this.getChildNodes([root]);
        let results: TreeNode[] = childs || [];
        if (includeRoot) {
            if (action) action(root);
            results.push(root);
        }
        while (childs != null) {
            results = results.concat(childs);
            childs.forEach(child => {
                if (action) action(child);
            });
            childs = this.getChildNodes(childs);
        }
        return results;
    }
    static getChildNodes(nodes: TreeNode[]) {
        let results: TreeNode[] = []
        nodes.forEach(child => {
            if (child.childs)
                results = results.concat(child.childs);
        });
        return results;
    }

    static recursiveTraverseTree(root: TreeNode,
        action: (treeNode: TreeNode) => void = node => { },
        includeRoot: boolean = true) {
        if ((includeRoot == false && !root.parent))
            null;
        else
            action(root);
        root.childs && root.childs.forEach(child => {
            this.recursiveTraverseTree(child, action, includeRoot);
        });
    }

    static maps = {
        '(': 0,
        "+": 13,
        "-": 13,
        "*": 14,
        "/": 14,
        '%': 14,
        "|": 5,
        "&": 6,
        "!": 16,
        "tan": 100,
        "atan": 100
    };


    static isValid(ch) {
        if (this.maps[ch])
            return false;
        return true;
    }

    static convertPostfixExpressionToTree(expression: string[]) {
        let stack = new Array<TreeNode>();
        let tokens: string[] = expression || [];
        tokens.forEach(token => {
            let root: TreeNode = { id: token, name: token, left: null, right: null };
            if (!this.isValid(token)) {
                let right: TreeNode = stack.pop();
                let left: TreeNode = stack.pop();
                root.left = left;
                root.right = right;
            }
            stack.push(root);
        });
        return stack.length == 1 ? stack.pop() : null;
    }

    static convertPrefixExpressionToTree(expression: string[]): TreeNode {
        let tokens: string[] = expression || [];
        let stack = new Array<TreeNode>();

        for (let i = tokens.length - 1; i >= 0; i--) {
            let root: TreeNode = { id: tokens[i], name: tokens[i], left: null, right: null };
            if (!this.isValid(tokens[i])) {
                let left: TreeNode = stack.pop();
                let right: TreeNode = stack.pop();
                root.left = left;
                root.right = right;
            }
            stack.push(root);
        }
        return stack.length == 1 ? stack.pop() : null;
    }
    static parseExpressionToPrefixExpression(expression: string) {
        let operators: string[] = [];//操作符
        let operands: string[] = [];//操作数
        let tokens: string[] = this.parseExpression(expression) || [];
        tokens = tokens.reverse();
        tokens.forEach(ch => {
            if (!this._Operators.some(it => it == ch)) {
                operands.push(ch);
            } else if (ch == ')') {
                operators.push(ch);
            } else if (ch == '(') {
                let top;
                while ((top = operators.pop()) != ')') {
                    // let left = operands.pop();
                    // let right = operands.pop();
                    operands.push(top); // + "," + left + "," + right + ",");
                }
            } else {//操作符
                while (!(operators.length == 0) && this.comparePriorityForPrefix(operators[operators.length - 1], ch)) {
                    //top > ch,pop out
                    // let left = operands.pop();
                    // let right = operands.pop();
                    operands.push(operators.pop()); //+ "," + left + "," + right);
                }
                operators.push(ch);
            }
        });
        while (!(operators.length == 0)) {
            // let left = operands.pop();
            // let right = operands.pop();
            operands.push(operators.pop());//+ "," + left + "," + right);
        }
        return operands.reverse();
    }

    /// <summary>
    /// 对于>或者&lt;运算符，判断实际是否为>=,&lt;&gt;、&lt;=，并调整当前运算符位置
    /// </summary>
    /// <param name="currentOpt">当前运算符</param>
    /// <param name="currentExp">当前表达式</param>
    /// <param name="currentOptPos">当前运算符位置</param>
    /// <param name="adjustOptPos">调整后运算符位置</param>
    /// <returns>返回调整后的运算符</returns>
    static adjustOperator(currentOpt: string, currentExp: string, optPosRef: { currOptPos: number }): string {
        switch (currentOpt) {
            case "<":
                if (currentExp.substr(optPosRef.currOptPos, 2) == "<=") {
                    optPosRef.currOptPos++;
                    return "<=";
                }
                if (currentExp.substr(optPosRef.currOptPos, 2) == "<>") {
                    optPosRef.currOptPos++;
                    return "<>";
                }
                return "<";

            case ">":
                if (currentExp.substr(optPosRef.currOptPos, 2) == ">=") {
                    optPosRef.currOptPos++;
                    return ">=";
                }
                return ">";
            case "t":
                if (currentExp.substr(optPosRef.currOptPos, 3) == "tan") {
                    optPosRef.currOptPos += 2;
                    return "tan";
                }
                return "error";
            case "a":
                if (currentExp.substr(optPosRef.currOptPos, 4) == "atan") {
                    optPosRef.currOptPos += 3;
                    return "atan";
                }
                return "error";
            default:
                return currentOpt;
        }
    }

    private static parseExpression(expression: string) {
        let curOpd: string = "";                                 //当前操作数
        let curOpt: string = "";                                 //当前运算符
        let curPos = 0;                                     //当前位置

        curPos = this.findOperator(expression, "");
        let exp = expression;
        exp += "@"; //结束操作符
        let results: string[] = [];
        let operands: string[] = [];
        let operators: string[] = [];
        let objRef = { currOptPos: 0 };
        while (true) {
            curPos = this.findOperator(exp, "");
            curOpd = exp.substr(0, curPos).trim();
            curOpt = exp.substr(curPos, 1);
            objRef.currOptPos = curPos;
            curOpt = this.adjustOperator(curOpt, exp, objRef);
            curPos = objRef.currOptPos;
            if (curOpd) {
                results.push(curOpd);
            }
            if (curOpt) {
                results.push(curOpt);
            }

            if (curOpt == "@") {
                break;
            }
            exp = exp.substr(curPos + 1).trim();
        }
        return results.slice(0, results.length - 1);
    }
    static parseExpressionToPostfixExpression(expression: string) {
        if (expression == "") return;
        if (!this.isMatching(expression)) {
            console.log("Expression is invalid");
        }
        let operators: string[] = [];//操作符
        let operands: string[] = [];//操作数
        let tokens: string[] = this.parseExpression(expression) || [];

        tokens.forEach(token => {
            if (!this._Operators.some(i => i == token)) { //ch >= '0' && ch <= '9'
                operands.push(token + "");
            } else if (token == '(') {
                operators.push(token);
            } else if (token == ')') {
                let top;
                while ((top = operators.pop()) != '(') {
                    // let left = operands.pop();
                    // let right = operands.pop();
                    operands.push(top); //left + "," + right + "," + top);
                }
            } else {//操作符
                while (!(operators.length == 0) && this.comparePriorityForPostfix(operators[operators.length - 1], token)) {//top >= ch,pop out
                    // let left = operands.pop();
                    // let right = operands.pop();
                    operands.push(operators.pop()); //left + "," + right + "," + operators.pop());
                }
                operators.push(token);
            }
        });

        while (operators.length != 0) {
            //let left = operands.pop();
            // let right = operands.pop();
            operands.push(operators.pop()); //left + "," + right + "," + operators.pop());
        }
        return operands;
    }
    static comparePriorityForPostfix(ch1, ch2): boolean {
        let int1 = this.maps[ch1];
        let int2 = this.maps[ch2];
        return int1 >= int2;
    }
    static comparePriorityForPrefix(ch1, ch2): boolean {
        let int1 = this.maps[ch1];
        let int2 = this.maps[ch2];
        return int1 > int2;
    }

    static stringToArray(str: string) {
        let chars: string[] = [];
        for (let index = 0; index < str.length; index++) {
            chars.push(str[index]);
        }
        return chars;
    }

    // 从右至左扫描表达式，遇到数字时，将数字压入堆栈，
    //遇到运算符时，弹出栈顶的两个数，用运算符对它们做相应的计算（栈顶元素 op 次顶元素），
    //并将结果入栈；重复上述过程直到表达式最左端，最后运算得出的值即为表达式的结果。
    // 例如前缀表达式“- × + 3 4 5 6”：
    // (1) 从右至左扫描，将6、5、4、3压入堆栈；
    // (2) 遇到+运算符，因此弹出3和4（3为栈顶元素，4为次顶元素，注意与后缀表达式做比较），计算出3+4的值，得7，再将7入栈；
    // (3) 接下来是×运算符，因此弹出7和5，计算出7×5=35，将35入栈；
    // (4) 最后是-运算符，计算出35-6的值，即29，由此得出最终结果。
    static calculatePrefixExpression(prefixExpression: string[]) {
        let stack: any[] = [];
        let tokens: string[] = prefixExpression || []; //this.stringToArray(prefixExpression);
        tokens = tokens.reverse();
        tokens.forEach(token => {
            if (!this._Operators.some(it => it == token)) {
                stack.push(+token);
            } else {//操作符
                let left = stack.pop(), right, result;
                if (!['tan', 'atan'].some(it => it == token)) {
                    right = stack.pop();
                }
                switch (token) {
                    case 'tan':
                        result = Math.tan(left);
                    case 'atan':
                        result = Math.atan(left);
                        break;
                    case '+':
                        result = left + right;
                        break;
                    case '-':
                        result = left - right;
                        break;
                    case '*':
                        result = left * right;
                        break;
                    case '/':
                        result = left / right;
                        break;
                    default:
                        break;
                }
                stack.push(result);
            }
        });
        return stack.pop();
    }
    // 从左至右扫描表达式，遇到数字时，将数字压入堆栈，遇到运算符时，弹出栈顶的两个数，用运算符对它们做相应的计算（次顶元素 op 栈顶元素），并将结果入栈；重复上述过程直到表达式最右端，最后运算得出的值即为表达式的结果。
    // 例如后缀表达式“3 4 + 5 × 6 -”：
    // (1) 从左至右扫描，将3和4压入堆栈；
    // (2) 遇到+运算符，因此弹出4和3（4为栈顶元素，3为次顶元素，注意与前缀表达式做比较），计算出3+4的值，得7，再将7入栈；
    // (3) 将5入栈；
    // (4) 接下来是×运算符，因此弹出5和7，计算出7×5=35，将35入栈；
    // (5) 将6入栈；
    // (6) 最后是-运算符，计算出35-6的值，即29，由此得出最终结果。
    static calculatePostfixExpression(postfixExpression: string[]) {
        let stack: any[] = [];
        let tokens: string[] = postfixExpression;  //this.stringToArray(postfixExpression);
        tokens.forEach(token => {
            if (!this._Operators.some(it => it == token)) {  //ch >= '0' && ch <= '9'
                stack.push(+token);
            } else {//操作符
                let right, left, result;
                right = stack.pop();
                if (!['tan', 'atan'].some(it => it == token)) {
                    left = stack.pop();
                }
                switch (token) {
                    case 'tan':
                        result = Math.tan(right);
                        break;
                    case 'atan':
                        result = Math.atan(right);
                    case '+':
                        result = left + right;
                        break;
                    case '-':
                        result = left - right;
                        break;
                    case '*':
                        result = left * right;
                        break;
                    case '/':
                        result = left / right;
                        break;
                    default:
                        break;
                }
                stack.push(result);
            }
        });
        return stack.pop();
    }
    private static _Operators = ["(", "tan", ")", "atan", "!", "*", "/", "%", "+", "-", "<", ">", "=", "&", "|", ",", "@"];
    /// <summary>
    /// 从表达式中查找运算符位置
    /// </summary>
    /// <param name="exp">表达式</param>
    /// <param name="findOpt">要查找的运算符</param>
    /// <returns>返回运算符位置</returns>
    private static findOperator(exp: string, findOpt: string) {
        let opt: string = "";
        for (let i = 0; i < exp.length; i++) {
            let chr: string = exp.substr(i, 1);
            if ("\"'#".includes(chr))//忽略双引号、单引号、井号中的运算符
            {
                if (opt.includes(chr))
                    opt = opt.replace(chr, ''); // (opt.indexOf(chr), 1);
                else
                    opt += chr;
            }
            if (opt == "") {
                if (findOpt != "") {
                    if (findOpt == chr)
                        return i;
                }
                else {
                    if (this._Operators.some(x => x.includes(chr)))
                        return i;
                }
            }
        }
        return -1;
    }
    private static isMatching(exp: string) {
        let opt: string = "";    //临时存储 " ' # (

        for (let i = 0; i < exp.length; i++) {
            let chr: string = exp.substr(i, 1);   //读取每个字符
            if ("\"'#".includes(chr))   //当前字符是双引号、单引号、井号的一种
            {
                if (opt.includes(chr))  //之前已经读到过该字符
                {
                    opt = opt.replace(chr, ""); // (opt.IndexOf(chr), 1);  //移除之前读到的该字符，即匹配的字符
                }
                else {
                    opt += chr;     //第一次读到该字符时，存储
                }
            }
            else if ("()".includes(chr))    //左右括号
            {
                if (chr == "(") {
                    opt += chr;
                }
                else if (chr == ")") {
                    if (opt.includes("(")) {
                        opt = opt.replace("(", "");//(opt.IndexOf("("), 1);
                    }
                    else {
                        return false;
                    }
                }
            }
        }
        return (opt == "");
    }
}