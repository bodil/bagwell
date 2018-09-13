//------------------- HICKEY TRIE

const BITS = 2;
const WIDTH = 1 << BITS;
const MASK = WIDTH - 1;

function index_for(index, level): number {
  const bit_offset = level * BITS;
  return (index >> bit_offset) & MASK;
}

type Vector = {
  size: number;
  level: number;
  root: TreeNode;
};

type TreeNode = any[];

let test = {
  size: 6, level: 1,
  root: [["1","2","3","4"],["5","6"]]
};

function make(): Vector {
  return { size: 0, level: 0, root: [] };
}

function lookup(vec: Vector, index: number): any {
  return lookup_tree(vec.root, vec.level, index);
}

function lookup_tree(node, level, index) {
  let i = index_for(index, level);
  if (level == 0) {
    return node[i];
  } else {
    return lookup_tree(node[i], level - 1, index);
  }
}

function single(level: number, value: any): TreeNode {
  if (level == 0) {
    return [value];
  } else {
    return [single(level - 1, value)];
  }
}

function push(vec: Vector, value: any): Vector {
  let result = push_tree(vec.root, vec.level, value);
  if (result.hasOwnProperty("full")) {
    let new_top = [vec.root, single(vec.level, value)];
    return {
      size: vec.size + 1,
      level: vec.level + 1,
      root: new_top
    };
  } else {
    return {
      size: vec.size + 1,
      level: vec.level,
      root: result
    };
  }
}

function push_tree(node, level, value): any {
  if (level == 0) {
    if (node.length < WIDTH) {
      return [...node, value];
    } else {
      return { full: true };
    }
  } else {
    let last = node[node.length - 1];
    let result = push_tree(last, level - 1, value);
    if (result.hasOwnProperty("full")) {
      if (node.length >= WIDTH) {
        return { full: true };
      } else {
        return [...node, [value]];
      }
    } else {
      let new_node = [...node];
      new_node[new_node.length - 1] = result;
      return new_node;
    }
  }
}

function make_count(count: number): Vector {
  let vec = make();
  for (let i = 0; i < count; i++) {
    vec = push(vec, i + 1);
  }
  return vec;
}

function append(left: Vector, right: Vector) {
  for (let i = 0; i < right.size; i++) {
    let value = lookup(right, i);
    left = push(left, value);
  }
  return left;
}

//------------- BAGWELL COMMENCES

const BITS = 2;
const WIDTH = 1 << BITS;
const MASK = WIDTH - 1;

function size_up_to(index, level, table): number {
  if (index == 0) {
    return 0;
  }
  if (level == 0) {
    return index;
  }
  if (table) {
    return table[index - 1];
  }
  return index * Math.pow(WIDTH, level);
}

function index_for(index, level, table): number {
  let guess = index / Math.pow(WIDTH, level);
  guess = Math.floor(guess);
  if (table) {
    while (table[guess] <= index) {
      guess += 1;
    }
  }
  return guess;
}

type Vector = {
  size: number;
  level: number;
  root: TreeNode;
};

type TreeNode = {
  sizes: number[],
  children: any[],
};

let test = {
  size: 6, level: 1,
  root: {sizes: [3, 6], children: [
    {sizes: null, children: ["1","2","3"]},
    {sizes: null, children: ["4","5","6"]},
  ]}
};

function make(): Vector {
  return { size: 0, level: 0, root: {
    sizes: [], children: []
  } };
}

function lookup(vec: Vector, index: number): any {
  return lookup_tree(vec.root, vec.level, index);
}

function lookup_tree(node, level, index) {
  let i = index_for(index, level, node.sizes);
  if (level == 0) {
    return node.children[i];
  } else {
    return lookup_tree(
      node.children[i], level - 1,
      index - size_up_to(i, level, node.sizes)
    );
  }
}
