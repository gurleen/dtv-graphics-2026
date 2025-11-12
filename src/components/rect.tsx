export type HexColor = `#${string}`;

export type Gradient = {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number; // for linear gradients, in degrees
  position?: string; // for radial gradients, e.g., 'center', 'top left'
};

export type RectProps = {
  width?: number;
  height?: number;
  color?: string;
  gradient?: Gradient;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
  opacity?: number
};

export function ensureHexColor(rawColor: string): HexColor {
  if(rawColor.startsWith("rgba")) return rawColor as HexColor;
  return (rawColor.startsWith("#") ? rawColor : `#${rawColor}`) as HexColor;
}

function buildGradient(gradient: Gradient): string {
  const colorStops = gradient.colors.map(c => ensureHexColor(c)).join(', ');

  if (gradient.type === 'linear') {
    const angle = gradient.angle ?? 180;
    return `linear-gradient(${angle}deg, ${colorStops})`;
  } else {
    const position = gradient.position ?? 'center';
    return `radial-gradient(circle at ${position}, ${colorStops})`;
  }
}

export function Rect({ width, height, color, gradient, children, className, id, borderRadius, style, opacity }: RectProps) {
  const background = gradient
    ? buildGradient(gradient)
    : color ? ensureHexColor(color) : undefined;

  return (
    <div id={id} className={className}
      style={{
        width: width ? `${width}px` : '',
        height: height ? `${height}px` : '',
        background: background,
        overflow: "hidden",
        borderRadius: borderRadius,
        opacity: opacity,
        ...style
      }}
    >
      {children}
    </div>
  );
}