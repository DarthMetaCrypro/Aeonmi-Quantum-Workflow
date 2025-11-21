import React from 'react';
import Svg, { Path, LinearGradient, Stop, Defs } from 'react-native-svg';
import { palette } from '../theme/colors';

interface KpiSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

const KpiSparkline: React.FC<KpiSparklineProps> = ({
  data,
  width = 120,
  height = 48,
}) => {
  if (!data.length) {
    return null;
  }
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const stepX = width / (data.length - 1);

  const path = data
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height} accessibilityRole="image">
      <Defs>
        <LinearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={palette.accentSecondary} stopOpacity="0.4" />
          <Stop offset="1" stopColor={palette.accentPrimary} stopOpacity="0.9" />
        </LinearGradient>
      </Defs>
      <Path d={path} stroke="url(#sparkGradient)" strokeWidth={3} fill="none" />
    </Svg>
  );
};

export default React.memo(KpiSparkline);
