import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { MAX_OPTIONS, MAX_VALUES_PER_OPTION, newId, newOption } from "../utils/variantOptions";

export default function ProductOptionEditor({ options, onChange, errors, disabled }) {
  function edit(id, transform) {
    onChange((current) => current.map((option) => option.id === id ? transform(option) : option));
  }
  function move(id, direction) {
    onChange((current) => {
      const index = current.findIndex((option) => option.id === id);
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function addOption() {
    const option = newOption();
    onChange((current) => [...current, option]);
  }
  function addValue(id) {
    const value = { id: newId(), value: "" };
    edit(id, (option) => ({ ...option, values: [...option.values, value] }));
  }

  return <section className="hlmp-options" aria-label="Product options">
    <div className="hlmp-section-heading">
      <h3>Product options</h3>
      <button type="button" className="hlmp-button" disabled={disabled || options.length >= MAX_OPTIONS} onClick={addOption}>
        <Plus size={16} />Add option
      </button>
    </div>
    {options.map((option, index) => <div className="hlmp-option-row" key={option.id}>
      <div className="hlmp-option-order">
        <button type="button" className="hlmp-icon" aria-label={`Move option ${index + 1} up`} disabled={disabled || index === 0} onClick={() => move(option.id, -1)}><ArrowUp size={15} /></button>
        <button type="button" className="hlmp-icon" aria-label={`Move option ${index + 1} down`} disabled={disabled || index === options.length - 1} onClick={() => move(option.id, 1)}><ArrowDown size={15} /></button>
      </div>
      <label className="hlmp-field hlmp-option-name">
        <span>Option name</span>
        <input value={option.name} maxLength={50} disabled={disabled} placeholder="For example, Color"
          aria-invalid={Boolean(errors[`option-${option.id}`])}
          onChange={(event) => edit(option.id, (current) => ({ ...current, name: event.target.value }))} />
      </label>
      <div className="hlmp-option-values">
        <span className="hlmp-option-label">Option values</span>
        <div className="hlmp-value-list">
          {option.values.map((value, valueIndex) => <span className="hlmp-value-chip" key={value.id}>
            <input type="text" value={value.value} maxLength={100} disabled={disabled}
              aria-label={`${option.name || `Option ${index + 1}`} value ${valueIndex + 1}`}
              placeholder="Value" style={{ width: `${Math.min(22, Math.max(6, value.value.length + 1))}ch` }}
              onChange={(event) => edit(option.id, (current) => ({ ...current,
                values: current.values.map((item) => item.id === value.id ? { ...item, value: event.target.value } : item),
              }))} />
            <button type="button" aria-label={`Remove value ${value.value || valueIndex + 1}`} disabled={disabled}
              onClick={() => edit(option.id, (current) => ({ ...current, values: current.values.filter((item) => item.id !== value.id) }))}><X size={14} /></button>
          </span>)}
          <button type="button" className="hlmp-text-button" disabled={disabled || option.values.length >= MAX_VALUES_PER_OPTION}
            onClick={() => addValue(option.id)}><Plus size={14} />Add value</button>
        </div>
      </div>
      <button type="button" className="hlmp-icon hlmp-option-remove" aria-label={`Remove option ${option.name || index + 1}`} disabled={disabled}
        onClick={() => onChange((current) => current.filter((item) => item.id !== option.id))}><Trash2 size={18} /></button>
      {errors[`option-${option.id}`] && <p className="hlmp-error hlmp-option-error" role="alert">{errors[`option-${option.id}`]}</p>}
    </div>)}
    {!options.length && <p className="hlmp-muted">Add an option and its values, then generate variants.</p>}
    <small className="hlmp-muted">Up to {MAX_OPTIONS} options. Click a value to rename it.</small>
  </section>;
}
