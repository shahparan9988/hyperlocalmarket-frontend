import { useId, useMemo } from "react";
import { categoryLabel, categoryLevels, createCategoryIndex } from "../utils/categoryTree";

export default function CategoryPicker({ categories, value, onChange, label = "Store category", disabled = false, emptyLabel = "All products" }) {
  const id = useId();
  const index = useMemo(() => createCategoryIndex(categories), [categories]);
  const levels = categoryLevels(index, value);
  return <fieldset className="hlmp-category-picker" disabled={disabled}>
    <legend>{label}</legend>
    <div className="hlmp-category-levels">
      {levels.map((level) => <label className="hlmp-field" key={level.parentId || "root"} htmlFor={`${id}-${level.depth}`}>
        <span>{level.depth === 0 ? "Category" : level.depth === 1 ? "Subcategory" : `Category level ${level.depth + 1}`}</span>
        <select id={`${id}-${level.depth}`} value={level.selectedId} onChange={(event) => onChange(event.target.value || level.parentId)}>
          <option value="">{level.depth === 0 ? emptyLabel : "Use this parent category"}</option>
          {level.items.map((node) => <option key={node.id} value={node.id}>{node.name}</option>)}
        </select>
      </label>)}
    </div>
    <p className="hlmp-muted hlmp-path">{value ? categoryLabel(index, value) : emptyLabel}</p>
  </fieldset>;
}