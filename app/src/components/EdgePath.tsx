import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { palette } from '../theme/colors';

interface EdgePathProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  highlighted?: boolean;
}

const computeCurve = (from: { x: number; y: number }, to: { x: number; y: number }) => {
  const deltaX = (to.x - from.x) * 0.5;
  return `M ${from.x} ${from.y} C ${from.x + deltaX} ${from.y}, ${to.x - deltaX} ${to.y}, ${to.x} ${to.y}`;
};

const EdgePath: React.FC<EdgePathProps> = ({ from, to, highlighted = false }) => {
  const d = computeCurve(from, to);
  return (
    <Svg style={{ position: 'absolute', left: 0, top: 0 }}>
      <Path
        d={d}
        stroke={highlighted ? palette.accentSecondary : '#1F3B4D'}
        strokeWidth={highlighted ? 4 : 3}
        fill="none"
        strokeLinecap="round"
      />
      {highlighted ? (
        <Circle cx={to.x} cy={to.y} r={5} fill={palette.accentPrimary} />
      ) : null}
    </Svg>
  );
};

export default React.memo(EdgePath);
