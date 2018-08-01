import * as React from 'react';

interface Props {
  className?: string;
  direction: 'up' | 'down';
  color?: string;
  width?: number;
  height?: number;
}

export function CaretIcon({
  direction,
  className,
  color,
  width,
  height,
}: Props) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      version="1.1"
      viewBox="0 0 22 22"
      width={width || 22}
      height={height || 22}
      xmlSpace="preserve"
    >
      <g
        transform={
          direction === 'down' ? 'scale(1, -1) translate(0,-22)' : undefined
        }
      >
        <line
          x1={5}
          y1={15}
          x2={11}
          y2={7}
          stroke={color || 'black'}
          strokeWidth={2}
        />
        <line
          x1={17}
          y1={15}
          x2={11}
          y2={7}
          stroke={color || 'black'}
          strokeWidth={2}
        />
      </g>
    </svg>
  );
}
