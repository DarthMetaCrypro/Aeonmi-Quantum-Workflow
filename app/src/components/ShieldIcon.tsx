import React from 'react';
import { Shield } from 'lucide-react-native';
import { palette } from '../theme/colors';

interface ShieldIconProps {
  size?: number;
  color?: string;
}

const ShieldIcon: React.FC<ShieldIconProps> = ({
  size = 18,
  color = palette.accentPrimary,
}) => {
  return <Shield size={size} color={color} />;
};

export default ShieldIcon;
