import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { SSBU_CHARACTERS } from '../data/characters';

interface CharacterInputProps {
  label: string;
  value: string;
  onChange: (character: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CharacterInput: React.FC<CharacterInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Type character name (e.g. Steve, Fox)...',
  disabled = false
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Filter characters by query
  const filtered = query.trim()
    ? SSBU_CHARACTERS.filter((c) =>
        c.toLowerCase().includes(query.trim().toLowerCase())
      )
    : SSBU_CHARACTERS.slice(0, 10);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (charName: string) => {
    setQuery(charName);
    onChange(charName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#0a0c10] border border-[#262c3a] focus:border-[#FF9933] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 font-medium transition-colors"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-[#14171f] border border-[#262c3a] rounded-xl shadow-2xl divide-y divide-[#262c3a]">
          {filtered.length > 0 ? (
            filtered.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => handleSelect(char)}
                className="w-full text-left px-3.5 py-2 text-sm text-gray-200 hover:bg-[#FF9933]/15 hover:text-white flex items-center justify-between transition-colors"
              >
                <span>{char}</span>
                {char.toLowerCase() === value.toLowerCase() && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-2 text-xs text-gray-500">
              No matching character found. You can type any name!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
