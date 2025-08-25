import { type BTreeNode, type AnimationStep } from "../interfaces/interfaces";

export class BTree {
  root: BTreeNode;
  order: number;
  private nodeIdCounter = 0;

  constructor(order: number) {
    this.order = order;
    this.root = this.createNode([], true);
  }

  private createNode(keys: number[], isLeaf: boolean): BTreeNode {
    return {
      keys: [...keys].sort((a, b) => a - b),
      children: isLeaf ? undefined : [],
      isLeaf,
      id: `node-${this.nodeIdCounter++}`
    };
  }

  // INSERT OPERATION
  insert(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    steps.push(this.createStep("insert", `Starting insertion of ${key}`));

    if (this.root.keys.length === 0) {
      this.root.keys.push(key);
      steps.push(this.createStep("insert", `Inserted ${key} into empty root`, [this.root.id!]));
      return steps;
    }

    if (this.root.keys.length === 2 * this.order - 1) {
      this.splitRoot(steps);
    }

    this.insertNonFull(this.root, key, steps);
    steps.push(this.createStep("insert", `Finished inserting ${key}`));
    return steps;
  }

  // SEARCH OPERATION
  search(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    steps.push(this.createStep("search", `Searching for key ${key}`));
    this.searchNode(this.root, key, steps);
    return steps;
  }

  private searchNode(node: BTreeNode, key: number, steps: AnimationStep[]) {
    steps.push(this.createStep("search", `Searching in node [${node.keys}]`, [node.id!]));

    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) {
      i++;
    }

    if (i < node.keys.length && key === node.keys[i]) {
      steps.push(this.createStep("search", `Found key ${key} at position ${i}`, [node.id!]));
      return;
    }

    if (node.isLeaf) {
      steps.push(this.createStep("search", `Key ${key} not found`));
      return;
    }

    steps.push(this.createStep("search", `Moving to child ${i}`, [node.id!, node.children![i].id!]));
    this.searchNode(node.children![i], key, steps);
  }

  // DELETE OPERATION
  delete(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    steps.push(this.createStep("delete", `Starting deletion of key ${key}`));

    this.deleteFromNode(this.root, key, steps);

    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children![0];
      steps.push(this.createStep("delete", `Root became empty, promoting child`, [this.root.id!]));
    }

    steps.push(this.createStep("delete", `Finished deletion of ${key}`));
    return steps;
  }

  private deleteFromNode(node: BTreeNode, key: number, steps: AnimationStep[]) {
    steps.push(this.createStep("delete", `Processing node [${node.keys}] for deletion`, [node.id!]));

    let idx = 0;
    while (idx < node.keys.length && key > node.keys[idx]) {
      idx++;
    }

    // Case 1: Key found in this node
    if (idx < node.keys.length && key === node.keys[idx]) {
      if (node.isLeaf) {
        // Case 1a: Key in leaf node
        node.keys.splice(idx, 1);
        steps.push(this.createStep("delete", `Deleted key ${key} from leaf`, [node.id!]));
      } else {
        // Case 1b: Key in internal node
        this.deleteFromInternalNode(node, idx, steps);
      }
      return;
    }

    // Case 2: Key not found in this node
    if (node.isLeaf) {
      steps.push(this.createStep("delete", `Key ${key} not found in tree`));
      return;
    }

    // Ensure the child has enough keys before descending
    if (node.children![idx].keys.length < this.order) {
      this.fillChild(node, idx, steps);
    }

    // Update index after potential merge
    if (idx > node.keys.length) {
      this.deleteFromNode(node.children![idx - 1], key, steps);
    } else {
      this.deleteFromNode(node.children![idx], key, steps);
    }
  }

  private deleteFromInternalNode(node: BTreeNode, idx: number, steps: AnimationStep[]) {
    const key = node.keys[idx];
    
    // Case 1b-i: Predecessor child has at least order keys
    if (node.children![idx].keys.length >= this.order) {
      const predecessor = this.getPredecessor(node.children![idx], steps);
      node.keys[idx] = predecessor;
      steps.push(this.createStep("delete", `Replaced with predecessor ${predecessor}`, [node.id!]));
      this.deleteFromNode(node.children![idx], predecessor, steps);
    }
    // Case 1b-ii: Successor child has at least order keys
    else if (node.children![idx + 1].keys.length >= this.order) {
      const successor = this.getSuccessor(node.children![idx + 1], steps);
      node.keys[idx] = successor;
      steps.push(this.createStep("delete", `Replaced with successor ${successor}`, [node.id!]));
      this.deleteFromNode(node.children![idx + 1], successor, steps);
    }
    // Case 1b-iii: Merge children
    else {
      this.mergeChildren(node, idx, steps);
      this.deleteFromNode(node.children![idx], key, steps);
    }
  }

  private getPredecessor(node: BTreeNode, steps: AnimationStep[]): number {
    if (node.isLeaf) {
      return node.keys[node.keys.length - 1];
    }
    steps.push(this.createStep("delete", `Finding predecessor`, [node.id!]));
    return this.getPredecessor(node.children![node.children!.length - 1], steps);
  }

  private getSuccessor(node: BTreeNode, steps: AnimationStep[]): number {
    if (node.isLeaf) {
      return node.keys[0];
    }
    steps.push(this.createStep("delete", `Finding successor`, [node.id!]));
    return this.getSuccessor(node.children![0], steps);
  }

  private fillChild(parent: BTreeNode, idx: number, steps: AnimationStep[]) {
    // Try borrowing from left sibling
    if (idx !== 0 && parent.children![idx - 1].keys.length >= this.order) {
      this.borrowFromLeft(parent, idx, steps);
    }
    // Try borrowing from right sibling
    else if (idx !== parent.keys.length && parent.children![idx + 1].keys.length >= this.order) {
      this.borrowFromRight(parent, idx, steps);
    }
    // Merge with sibling
    else {
      if (idx !== parent.keys.length) {
        this.mergeChildren(parent, idx, steps);
      } else {
        this.mergeChildren(parent, idx - 1, steps);
      }
    }
  }

  private borrowFromLeft(parent: BTreeNode, idx: number, steps: AnimationStep[]) {
    const child = parent.children![idx];
    const leftSibling = parent.children![idx - 1];

    child.keys.unshift(parent.keys[idx - 1]);
    parent.keys[idx - 1] = leftSibling.keys.pop()!;

    if (!child.isLeaf) {
      child.children!.unshift(leftSibling.children!.pop()!);
    }

    steps.push(this.createStep("delete", `Borrowed from left sibling`, [parent.id!, child.id!, leftSibling.id!]));
  }

  private borrowFromRight(parent: BTreeNode, idx: number, steps: AnimationStep[]) {
    const child = parent.children![idx];
    const rightSibling = parent.children![idx + 1];

    child.keys.push(parent.keys[idx]);
    parent.keys[idx] = rightSibling.keys.shift()!;

    if (!child.isLeaf) {
      child.children!.push(rightSibling.children!.shift()!);
    }

    steps.push(this.createStep("delete", `Borrowed from right sibling`, [parent.id!, child.id!, rightSibling.id!]));
  }

  private mergeChildren(parent: BTreeNode, idx: number, steps: AnimationStep[]) {
    const child = parent.children![idx];
    const rightSibling = parent.children![idx + 1];

    // Move key from parent to child
    child.keys.push(parent.keys[idx]);
    
    // Move keys from right sibling
    child.keys.push(...rightSibling.keys);
    
    // Move children if not leaf
    if (!child.isLeaf) {
      child.children!.push(...rightSibling.children!);
    }
    
    // Remove key from parent and sibling from children
    parent.keys.splice(idx, 1);
    parent.children!.splice(idx + 1, 1);

    steps.push(this.createStep("delete", `Merged nodes`, [parent.id!, child.id!, rightSibling.id!]));
  }

  // Helper methods for insert (unchanged from previous implementation)
  private createStep(
    action: "insert" | "delete" | "split" | "merge" | "traverse" | "search", message: string, highlight?: string[]): AnimationStep {
    return {
      tree: JSON.parse(JSON.stringify(this.root)),
      action,
      message,
      highlight: highlight,
    };
  }

  private insertNonFull(node: BTreeNode, key: number, steps: AnimationStep[]) {
    let i = node.keys.length - 1;
    
    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) i--;
      node.keys.splice(i + 1, 0, key);
      steps.push(this.createStep("insert", `Inserted ${key} into leaf`, [node.id!]));
    } else {
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      
      if (node.children![i].keys.length === 2 * this.order - 1) {
        this.splitChild(node, i, node.children![i], steps);
        if (key > node.keys[i]) i++;
      }
      this.insertNonFull(node.children![i], key, steps);
    }
  }

  private splitRoot(steps: AnimationStep[]) {
    const oldRoot = this.root;
    const newRoot = this.createNode([], false);
    newRoot.children = [oldRoot];
    this.root = newRoot;
    this.splitChild(newRoot, 0, oldRoot, steps);
  }

  private splitChild(parent: BTreeNode, index: number, child: BTreeNode, steps: AnimationStep[]) {
    const newChild = this.createNode(child.keys.splice(this.order), child.isLeaf!);
    
    if (!child.isLeaf) {
      newChild.children = child.children!.splice(this.order);
    }
    
    const medianKey = child.keys.pop()!;
    parent.children!.splice(index + 1, 0, newChild);
    parent.keys.splice(index, 0, medianKey);
    
    steps.push(this.createStep("split", `Split with median ${medianKey}`, [parent.id!, child.id!, newChild.id!]));
  }
}