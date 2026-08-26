import React from 'react';
import { Check, CheckSquare, Square } from 'lucide-react';

interface CheckboxToggleProps {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  badge?: string;
}

/**
 * Single Checkbox item that toggles between checked (■) and unchecked (□).
 */
export const CheckboxToggle: React.FC<CheckboxToggleProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  badge,
}) => {
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all text-left select-none cursor-pointer ${
        checked
          ? 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
          : 'bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="shrink-0 text-xs">
        {checked ? (
          <CheckSquare className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        ) : (
          <Square className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
        )}
      </span>
      <span>{label}</span>
      {badge && (
        <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${
          checked ? 'bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-100' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
};

interface MultiCheckboxGroupProps {
  options: (string | { label: string; value: string; badge?: string })[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Multi-checkbox group where clicking any item toggles its presence in the selected array.
 */
export const MultiCheckboxGroup: React.FC<MultiCheckboxGroupProps> = ({
  options,
  selectedValues = [],
  onChange,
  disabled = false,
  className = 'flex flex-wrap gap-1.5',
}) => {
  const handleToggle = (val: string) => {
    if (disabled) return;
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className={className}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const badge = typeof opt === 'string' ? undefined : opt.badge;
        const isChecked = selectedValues.includes(val);

        return (
          <CheckboxToggle
            key={val}
            label={label}
            badge={badge}
            checked={isChecked}
            onChange={() => handleToggle(val)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};

interface RadioToggleGroupProps {
  options: (string | { label: string; value: string; badge?: string })[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  allowDeselect?: boolean;
  className?: string;
}

/**
 * Radio group with toggle/deselect capability (clicking active item can deselect).
 */
export const RadioToggleGroup: React.FC<RadioToggleGroupProps> = ({
  options,
  value,
  onChange,
  disabled = false,
  allowDeselect = true,
  className = 'flex flex-wrap gap-1.5',
}) => {
  const handleSelect = (val: string) => {
    if (disabled) return;
    if (allowDeselect && value === val) {
      onChange('');
    } else {
      onChange(val);
    }
  };

  return (
    <div className={className}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const badge = typeof opt === 'string' ? undefined : opt.badge;
        const isChecked = value === val;

        return (
          <CheckboxToggle
            key={val}
            label={label}
            badge={badge}
            checked={isChecked}
            onChange={() => handleSelect(val)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
