export interface TreeNode {
    id?: string;
    name?: string;
    path?: string;
    level?: number;
    ord?: number;
    tag?;
    left?: TreeNode;
    right?: TreeNode;
    parent?: TreeNode;
    childs?: TreeNode[];
}