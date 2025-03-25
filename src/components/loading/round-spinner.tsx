import tailwindMerge from '../../utils/tailwind-merge';

export type RoundSpinnerTheme = 'primary' | 'white';

export type RoundSpinnerProps = {
  className?: string;
  theme?: RoundSpinnerTheme;
};

export default function RoundSpinner({
  className,
  theme = 'white',
}: RoundSpinnerProps) {
  const color = theme === 'primary' ? '#5214DC' : '#FFFFFF';

  return (
    <div className={tailwindMerge('w-6 h-6', className)}>
      <svg
        className="w-6 h-6 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="path"
          cx="12"
          cy="12"
          r="8"
          fill="none"
          opacity="0.2"
          strokeWidth="2"
          stroke={color}
        />
        <circle
          transform="rotate(-90, 12, 12)"
          cx="12"
          cy="12"
          r="8"
          fill="none"
          pathLength="1"
          strokeDasharray="0.3 1"
          strokeWidth="2"
          strokeLinecap="round"
          stroke={color}
        />
      </svg>
    </div>
  );
}
