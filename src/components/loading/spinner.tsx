import React from 'react';

interface SpinnerProps {
  size?: string; // Define size for spinner
  color?: string; // Define color for spinner
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'h-16 w-16', color = 'border-blue-500' }) => {
  return (
    <div className={`flex justify-center items-center`}>
      <div className={`animate-spin rounded-full border-t-2 border-b-2 ${size} ${color}`} />
    </div>
  );
};

export default Spinner;
