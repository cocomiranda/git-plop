import React, { useState } from 'react';
import './ViewToggle.css';

const ViewToggle = ({ onChange }) => {
  const [active, setActive] = useState('Month');

  const handleClick = (view) => {
    setActive(view);
    if (onChange) onChange(view);
  };

  return (
    <div className="view-toggle small">
      <button
        className={active === 'Week' ? 'active' : ''}
        onClick={() => handleClick('Week')}
      >
        Week
      </button>
      <button
        className={active === 'Month' ? 'active' : ''}
        onClick={() => handleClick('Month')}
      >
        Month
      </button>
      <button
        className={active === 'Year' ? 'active' : ''}
        onClick={() => handleClick('Year')}
      >
        Year
      </button>
    </div>
  );
};

export default ViewToggle; 