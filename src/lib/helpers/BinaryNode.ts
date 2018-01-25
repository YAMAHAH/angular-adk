/// <summary>
/// 二叉树节点
/// </summary>
/// <typeparam name="K"></typeparam>
/// <typeparam name="V"></typeparam>
export class BinaryNode<K, V>
{
    /// <summary>
    /// 节点元素
    /// </summary>
    key: K;

    /// <summary>
    /// 节点中的附加值
    /// </summary>
    public attach = new Set<V>();

    /// <summary>
    /// 左节点
    /// </summary>
    public left: BinaryNode<K, V>;

    /// <summary>
    /// 右节点
    /// </summary>
    public right: BinaryNode<K, V>;


    constructor(key: K, value: V, left: BinaryNode<K, V>, right: BinaryNode<K, V>) {
        //KV键值对
        this.key = key;
        this.attach.add(value);
        this.left = left;
        this.right = right;
    }

}

export class BinaryTree<K, V>{
    node: BinaryNode<K, V> = null;

    LevelOrder(T: BinaryNode<K, V>) {
        let p: BinaryNode<K, V> = T;
        //队列  
        let queue = new Array<BinaryNode<K, V>>();
        //根节点入队  
        queue.push(p);
        //队列不空循环  
        while (queue.length > 0) {
            //对头元素出队  
            p = queue.shift(); //queue[0]; //fornt取出第一个元素
            //访问p指向的结点  
            //  printf("%c ", p -> data);
            //退出队列  
            //删除第一个元素
            //左子树不空，将左子树入队  
            if (p.left != null) {
                queue.push(p.left);
            }
            //右子树不空，将右子树入队  
            if (p.right != null) {
                queue.push(p.right);
            }
        }
    }
    PreOrder(T: BinaryNode<K, V>) {
        if (T != null) {
            //访问根节点  
            this.Visit(T);
            //访问左子结点  
            this.PreOrder(T.left);
            //访问右子结点  
            this.PreOrder(T.right);
        }
    }
    PreOrder2(T: BinaryNode<K, V>) {
        let stack = new Array<BinaryNode<K, V>>();
        //p是遍历指针  
        let p = T;
        //栈不空或者p不空时循环  
        while (p || stack.length > 0) {
            if (p != null) {
                //存入栈中  
                stack.push(p);
                //访问根节点  
                // printf("%c ", p -> data);
                //遍历左子树  
                p = p.left;
            }
            else {
                //退栈  
                p = stack.pop();
                //访问右子树  
                p = p.right;
            }
        }//while  
    }
    //中序遍历  
    InOrder(T: BinaryNode<K, V>) {
        if (T != null) {
            //访问左子结点  
            this.InOrder(T.left);
            //访问根节点  
            this.Visit(T);
            //访问右子结点  
            this.InOrder(T.right);
        }
    }

    InOrder2(T: BinaryNode<K, V>) {
        let stack = new Array<BinaryNode<K, V>>();
        //p是遍历指针  
        let p = T;
        //栈不空或者p不空时循环  
        while (p || stack.length > 0) {
            if (p != null) {
                //存入栈中  
                stack.push(p);
                //遍历左子树  
                p = p.left;
            }
            else {
                //退栈，访问根节点  
                p = stack.pop();
                // printf("%c ", p -> data);
                // stack.pop();
                //访问右子树  
                p = p.right;
            }
        }//while  
    }
    //后序遍历  
    PostOrder(T: BinaryNode<K, V>) {
        if (T != null) {
            //访问左子结点  
            this.PostOrder(T.left);
            //访问右子结点  
            this.PostOrder(T.right);
            //访问根节点  
            this.Visit(T);
        }
    }
    PostOrder2(T: BinaryNode<K, V>) {
        let stack = new Array<BiTNodePost<K, V>>();
        //p是遍历指针  
        let p = T;
        let BT: BiTNodePost<K, V>;
        //栈不空或者p不空时循环  
        while (p != null || stack.length > 0) {
            //遍历左子树  
            while (p != null) {
                BT.biTree = p;
                //访问过左子树  
                BT.tag = 'L';
                stack.push(BT);
                p = p.left;
            }
            //左右子树访问完毕访问根节点  
            while (stack.length > 0 && (stack[stack.length - 1]).tag == 'R') {
                // BT = stack[stack.length - 1];
                //退栈  
                BT = stack.pop();
                //  printf("%c ", BT -> biTree -> data);
            }
            //遍历右子树  
            if (stack.length > 0) {
                BT = stack[stack.length - 1];
                //访问过右子树  
                BT.tag = 'R';
                p = BT.biTree;
                p = p.right;
            }
        }//while  
    }
    Visit(T) {

    }
    // Add(key: K, value: V) {
    //     this.node = Add(key, value, node);
    // }
    // Remove(key: K, value: V) {
    //     this.node = Remove(key, value, node);
    // }
    Add(key: K, value: V, tree: BinaryNode<K, V>): BinaryNode<K, V> {
        if (tree == null)
            tree = new BinaryNode<K, V>(key, value, null, null);

        //左子树
        if (key < tree.key)
            tree.left = this.Add(key, value, tree.left);

        //右子树
        if (key > tree.key)
            tree.right = this.Add(key, value, tree.right);

        //将value追加到附加值中（也可对应重复元素）
        if (key == tree.key)
            tree.attach.add(value);

        return tree;
    }

    /// <summary>
    /// 删除当前树中的节点
    /// </summary>
    /// <param name="key"></param>
    /// <param name="tree"></param>
    /// <returns></returns>
    Remove(key: K, value: V, tree: BinaryNode<K, V>): BinaryNode<K, V> {
        if (tree == null)
            return null;

        //左子树
        if (key < tree.key)
            tree.left = this.Remove(key, value, tree.left);

        //右子树
        if (key > tree.key)
            tree.right = this.Remove(key, value, tree.right);

        /*相等的情况*/
        if (key == tree.key) {
            //判断里面的HashSet是否有多值
            if (tree.attach.size > 1) {
                //实现惰性删除
                tree.attach.delete(value);
            }
            else {
                //有两个孩子的情况
                if (tree.left != null && tree.right != null) {
                    //根据二叉树的中顺遍历，需要找到”有子树“的最小节点
                    tree.key = this.findMin(tree.right).key;

                    //删除右子树的指定元素
                    tree.right = this.Remove(key, value, tree.right);
                }
                else {
                    //单个孩子的情况
                    tree = tree.left == null ? tree.right : tree.left;
                }
            }
        }
        return tree;
    }
    /// <summary>
    /// 树的指定范围查找
    /// </summary>
    /// <param name="range1"></param>
    /// <param name="range2"></param>
    /// <param name="tree"></param>
    /// <returns></returns>
    searchRange(min: K, max: K, hashSet: Set<V>, tree: BinaryNode<K, V>): Set<V> {
        if (tree == null)
            return hashSet;

        //遍历左子树（寻找下界）
        if (min < tree.key)
            this.searchRange(min, max, hashSet, tree.left);

        //当前节点是否在选定范围内
        if (min <= tree.key && max >= tree.key) {
            //等于这种情况
            tree.attach.forEach(it => hashSet.add(it));
        }

        //遍历右子树（两种情况：①:找min的下限 ②：必须在Max范围之内）
        if (min > tree.key || max > tree.key)
            this.searchRange(min, max, hashSet, tree.right);

        return hashSet;
    }
    findMin(tree: BinaryNode<K, V>): BinaryNode<K, V> {
        if (tree == null)
            return null;
        if (tree.left == null)
            return tree;
        return this.findMin(tree.left);
    }
    /// <summary>
    /// 找到当前树的最大节点
    /// </summary>
    /// <param name="tree"></param>
    /// <returns></returns>
    findMax(tree: BinaryNode<K, V>): BinaryNode<K, V> {
        if (tree == null)
            return null;

        if (tree.right == null)
            return tree;

        return this.findMax(tree.right);
    }
    contains(key: K, tree: BinaryNode<K, V>): boolean {
        if (tree == null)
            return false;
        //左子树
        if (key < tree.key)
            return this.contains(key, tree.left);
        //右子树
        if (key > tree.key)
            return this.contains(key, tree.right);
        return true;
    }
}

interface BiTNodePost<K, V> {
    biTree: BinaryNode<K, V>;
    tag;
}