import type { ReactNode } from "react";
import React from "react";

export interface ZLayersProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export const ZLayers: React.FC<ZLayersProps> = ({ children, align = 'start' }) => {
  const alignClass = align === 'end' ? 'items-end' : align === 'center' ? 'items-center' : '';
  
  return (
    <div className={`grid ${alignClass}`}>
      {React.Children.map(children, (child, index) => (
        <div 
          className="col-start-1 row-start-1"
          style={{ zIndex: index }}
          key={index}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export interface LayerProps {
  children: ReactNode;
  className?: string;
}

export const Layer: React.FC<LayerProps> = ({ children, className = "" }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};