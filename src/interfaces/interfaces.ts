export interface BTreeNode {
  keys: number[];
  children?: BTreeNode[];
  isLeaf?: boolean;
  x?: number;  // For positioning
  y?: number;
  id?: string; // For animations
};

export interface BTreeConfig {
  order: number; // Min degree (e.g., order=2 → max 3 keys)
};

export interface AnimationStep  {
  tree: BTreeNode;
  action: "insert" | "delete" | "split" | "merge" | "traverse";
  highlight?: string[]; // Node IDs to highlight
  message: string;
};