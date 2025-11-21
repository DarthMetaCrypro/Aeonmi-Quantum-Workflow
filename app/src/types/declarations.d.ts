declare module 'react-native-svg' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    preserveAspectRatio?: string;
  }

  export default class Svg extends React.Component<SvgProps> {}
  export class Path extends React.Component<any> {}
  export class LinearGradient extends React.Component<any> {}
  export class Stop extends React.Component<any> {}
  export class Defs extends React.Component<any> {}
  export class Polyline extends React.Component<any> {}
  export class Circle extends React.Component<any> {}
}
