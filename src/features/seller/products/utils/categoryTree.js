// A category is a flat node: { id, parentId, name, sortOrder }. No depth limit.
export function createCategoryIndex(categories = []) {
  const byId = new Map();
  const children = new Map([[null, []]]);
  for (const item of categories) {
    if (!item.id || byId.has(item.id)) throw new Error("Category IDs must be unique.");
    const node = { ...item, parentId: item.parentId || null };
    byId.set(node.id, node);
    if (!children.has(node.id)) children.set(node.id, []);
  }
  for (const node of byId.values()) {
    if (node.parentId !== null && !byId.has(node.parentId)) {
      throw new Error(`The parent of category '${node.name}' is missing.`);
    }
    children.get(node.parentId).push(node);
  }
  // Walk from roots. A cycle cannot be reached from a root in a single-parent tree.
  const stack = [...children.get(null)];
  let visited = 0;
  while (stack.length) {
    const node = stack.pop();
    visited += 1;
    for (const child of children.get(node.id)) stack.push(child);
  }
  if (visited !== byId.size) throw new Error("Category parents contain a cycle.");
  for (const siblings of children.values()) {
    siblings.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  }
  return { byId, children };
}

export function categoryPath(index, categoryId) {
  const path = [];
  let id = categoryId;
  while (id) {
    const node = index.byId.get(id);
    if (!node) throw new Error("A selected category is no longer available. Reload the page.");
    path.push(node);
    id = node.parentId;
  }
  return path.reverse();
}

export function categoryLabel(index, categoryId) {
  return categoryId ? categoryPath(index, categoryId).map((node) => node.name).join(" / ") : "All products";
}

export function descendantIds(index, categoryId) {
  if (!index.byId.has(categoryId)) return new Set();
  const ids = new Set();
  const stack = [categoryId];
  while (stack.length) {
    const id = stack.pop();
    ids.add(id);
    for (const child of index.children.get(id)) stack.push(child.id);
  }
  return ids;
}

export function categoryLevels(index, selectedId) {
  const path = categoryPath(index, selectedId);
  const levels = [];
  let parentId = null;
  for (let depth = 0; ; depth += 1) {
    const items = index.children.get(parentId) || [];
    if (!items.length) break;
    const selected = path[depth];
    levels.push({ parentId, items, selectedId: selected?.id || "", depth });
    if (!selected) break;
    parentId = selected.id;
  }
  return levels;
}
