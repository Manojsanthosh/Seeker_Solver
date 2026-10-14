import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TagInputProps {
  label?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onChange,
  suggestions = ['React', 'TypeScript', 'Python', 'AWS', 'Node.js', 'UI/UX Design', 'Kubernetes'],
  placeholder = 'Type a skill and press Enter...',
  error,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="w-full space-y-2 text-left">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      {/* Selected tags */}
      <div
        className={cn(
          'min-h-[48px] p-2 flex flex-wrap gap-2 items-center bg-white border border-slate-300 rounded-xl transition-colors focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20',
          error && 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-500/20'
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-sm font-medium rounded-lg animate-in fade-in zoom-in-95"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-400 hover:text-indigo-700 focus:outline-none min-w-[20px] min-h-[20px] inline-flex items-center justify-center rounded-full"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[140px] border-0 bg-transparent p-1 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>

      {/* Suggested Quick Tags */}
      {suggestions && suggestions.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-slate-500 mb-1.5">Suggested popular skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions
              .filter((s) => !tags.includes(s))
              .slice(0, 6)
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  <Plus className="w-3 h-3 text-slate-500" />
                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
