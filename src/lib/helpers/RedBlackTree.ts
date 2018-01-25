export class RedBlackNode<T> {
    key: Comparable<T>;
    leftChild: RedBlackNode<T> = null;
    rightChild: RedBlackNode<T> = null;
    color: boolean = false;

    constructor(key: Comparable<T>, color: boolean) {
        this.key = key;
        this.color = color;
    }


}

export interface IComparable<T> {
    compareTo(target: IComparable<T>);
}

export abstract class SearchBase {
    public a: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    //public Character[] a = {'a' ,'b' ,'c' ,'d' ,'e' ,'f' ,'g' ,'h' ,'i'};

    abstract search<T>(key: Comparable<T>, root: RedBlackNode<T>);
}

export abstract class Comparable<T> implements IComparable<T> {
    compareTo(target: Comparable<T>) {
        return -1;
    }
}

const RED = true;
const BLACK = false;
export class RedBlackTree extends SearchBase {

    search<T>(key: Comparable<T>, root: RedBlackNode<T>) {
        let node = root;
        while (node != null) {
            if (key.compareTo(node.key) < 0) {
                node = node.leftChild;
            } else if (key.compareTo(node.key) > 0) {
                node = node.rightChild;
            } else {
                break;
            }
        }

        if (node == null)
            return null;
        else
            return node.key;
    }

    rotateLeft<T>(h: RedBlackNode<T>): RedBlackNode<T> {
        let x: RedBlackNode<T> = h.rightChild;
        h.rightChild = x.leftChild;
        x.leftChild = h;
        x.color = h.color;
        h.color = RED; //red
        return x;
    }

    rotateRight<T>(h: RedBlackNode<T>) {
        let x = h.leftChild;
        h.leftChild = x.rightChild;
        x.rightChild = h;
        x.color = h.color;
        h.color = RED;
        return x;
    }

    flipColors<T>(h: RedBlackNode<T>) {
        h.color = RED;
        h.leftChild.color = BLACK;
        h.rightChild.color = BLACK;
    }

    isRed<T>(node: RedBlackNode<T>) {
        if (node == null)
            return false;
        return node.color == RED;
    }

    put<T>(node: RedBlackNode<T>, key: Comparable<T>): RedBlackNode<T> {
        if (node == null)
            return new RedBlackNode(key, RED);

        if (key.compareTo(node.key) < 0)
            node.leftChild = this.put(node.leftChild, key);
        else if (key.compareTo(node.key) > 0)
            node.rightChild = this.put(node.rightChild, key);
        else
            node.key = key;

        if (this.isRed(node.rightChild) && !this.isRed(node.leftChild))
            node = this.rotateLeft(node);
        if (this.isRed(node.leftChild) && this.isRed(node.leftChild.leftChild))
            node = this.rotateRight(node);
        if (this.isRed(node) && this.isRed(node.rightChild))
            this.flipColors(node);

        return node;
    }

    traverseTree<T>(node: RedBlackNode<T>) {
        if (node == null)
            return;

        this.traverseTree(node.leftChild);
        console.log(node.key);
        this.traverseTree(node.rightChild);
    }

    // public static <T> void main(String[] args) {
    //     Integer[] b = {1,4,2,6,7,0,3};
    //     RedBlackTree redBlackTree = new RedBlackTree();
    //     RedBlackTree.Node<Integer> root = null;

    //     for(int i=0;i<b.length;i++) {
    //         root = redBlackTree.put(root, b[i]);
    //     }

    //     redBlackTree.traverseTree(root);

    //     System.out.println();
    //     Integer key = redBlackTree.search(8, root);
    //     System.out.println(key);
    // }
}

