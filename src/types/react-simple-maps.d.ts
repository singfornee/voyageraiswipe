// src/react-simple-maps.d.ts
declare module 'react-simple-maps' {
    import { ComponentType, SVGProps } from 'react';
  
    export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
      projectionConfig?: Record<string, unknown>;
      width?: number;
      height?: number;
    }
  
    export const ComposableMap: ComponentType<ComposableMapProps>;
  
    export interface GeographiesProps {
      geography: string | object;
      children: (data: {
        geographies: any[];
        projection: any;
        path: any;
      }) => React.ReactNode;
    }
  
    export const Geographies: ComponentType<GeographiesProps>;
  
    export interface GeographyProps {
      geography: any;
      projection: any;
      path: any;
    }
  
    export const Geography: ComponentType<GeographyProps>;
  }
  