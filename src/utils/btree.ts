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
      keys,
      children: isLeaf ? undefined : [],
      isLeaf,
      id: `node-${this.nodeIdCounter++}`
    };
  }

  insert(key: number): AnimationStep[] {
    const steps: AnimationStep[] = [];
    
    // Initial state
    steps.push(this.createStep("insert", `Starting insertion of ${key}`));

    // If root is full, split it first
    if (this.root.keys.length === 2 * this.order - 1) {
      this.splitRoot(steps);
    }

    this.insertNonFull(this.root, key, steps);
    
    // Final state
    steps.push(this.createStep("insert", `Finished inserting ${key}`));
    return steps;
  }

  private createStep(
    action: "insert" | "delete" | "split" | "merge" | "traverse",
    message: string,
    highlight?: string[]
  ): AnimationStep {
    return {
      tree: JSON.parse(JSON.stringify(this.root)),
      action,
      message,
      highlight: highlight,
    };
  }

  private insertNonFull(node: BTreeNode, key: number, steps: AnimationStep[]) {
    let i = node.keys.length - 1;
    
    // Highlight current node
    steps.push(this.createStep("traverse", `Processing node [${node.keys}]`, [node.id!]));

    if (node.isLeaf) {
      // Insert into leaf
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      node.keys.splice(i + 1, 0, key);
      steps.push(this.createStep("insert", `Inserted ${key} into leaf`, [node.id!]));
    } else {
      // Find child to descend into
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      i++;
      
      const child = node.children![i];
      steps.push(this.createStep("traverse", 
        `Moving to child ${i} (keys: [${child.keys}])`, 
        [node.id!, child.id!]
      ));

      // Split child if full
      if (child.keys.length === 2 * this.order - 1) {
        this.splitChild(node, i, child, steps);
        if (key > node.keys[i]) {
          i++;
        }
      }
      
      this.insertNonFull(node.children![i], key, steps);
    }
  }

  private splitRoot(steps: AnimationStep[]) {
    const oldRoot = this.root;
    const newRoot = this.createNode([], false);
    newRoot.children = [oldRoot];
    this.root = newRoot;
    
    steps.push(this.createStep("split", 
      "Splitting full root node", 
      [oldRoot.id!]
    ));
    
    this.splitChild(newRoot, 0, oldRoot, steps);
  }

  private splitChild(parent: BTreeNode, index: number, child: BTreeNode, steps: AnimationStep[]) {
    const newChild = this.createNode(
      child.keys.splice(this.order), // Take upper half keys
      child.isLeaf!
    );
    
    if (!child.isLeaf) {
      newChild.children = child.children!.splice(this.order);
    }
    
    const medianKey = child.keys.pop()!;
    parent.children!.splice(index + 1, 0, newChild);
    parent.keys.splice(index, 0, medianKey);
    
    steps.push(this.createStep("split", 
      `Split child node at position ${index} with median ${medianKey}`,
      [parent.id!, child.id!, newChild.id!]
    ));
  }

  // Additional operations would go here...
  // delete(key: number): AnimationStep[] { ... }
  // search(key: number): AnimationStep[] { ... }
}