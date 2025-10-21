import React, { useState, useRef } from 'react';
import { useRange } from 'react-instantsearch-hooks-web';
import { useDebounce } from 'use-debounce';

export function CustomRangeInput(props) {
  const { start, range, canRefine, refine } = useRange(props);
  const { min, max } = range;

  // We use local state to manage the input values
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');

  // Debounce the refine function to avoid too many API calls
  const [debouncedRefine] = useDebounce(refine, 500);

  const onMinChange = (e) => {
    const value = e.currentTarget.value;
    setMinVal(value);
    debouncedRefine([value || min, maxVal || max]);
  };

  const onMaxChange = (e) => {
    const value = e.currentTarget.value;
    setMaxVal(value);
    debouncedRefine([minVal || min, value || max]);
  };

  return (
    <div className="price-range-inputs">
      <input
        type="number"
        placeholder={min !== undefined ? `Min (${min})` : 'Min'}
        value={minVal}
        onChange={onMinChange}
        disabled={!canRefine}
      />
      <span>-</span>
      <input
        type="number"
        placeholder={max !== undefined ? `Max (${max})` : 'Max'}
        value={maxVal}
        onChange={onMaxChange}
        disabled={!canRefine}
      />
    </div>
  );
}