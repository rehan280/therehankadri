import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const defaultProps: IconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
};

// Helper to map `size` to `width` and `height` for drop-in compatibility
const getProps = (props: IconProps) => {
  const { size, width, height, ...rest } = props;
  return {
    ...defaultProps,
    width: size ?? width ?? defaultProps.width,
    height: size ?? height ?? defaultProps.height,
    ...rest,
  };
};

// Duotone Premium Icons
export const PremiumDollarSign = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
  </svg>
);

export const PremiumHash = (props: IconProps) => (
  <svg {...getProps(props)}>
    <line x1="4" x2="20" y1="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <line x1="4" x2="20" y1="15" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <line x1="10" x2="8" y1="3" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" x2="14" y1="3" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumType = (props: IconProps) => (
  <svg {...getProps(props)}>
    <rect width="20" height="20" x="2" y="2" rx="4" fill="currentColor" opacity="0.15" />
    <polyline points="4 7 4 4 20 4 20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" x2="15" y1="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" x2="12" y1="4" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumCalculator = (props: IconProps) => (
  <svg {...getProps(props)}>
    <rect width="16" height="20" x="4" y="2" rx="4" fill="currentColor" opacity="0.15" />
    <rect width="16" height="20" x="4" y="2" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="8" x2="16" y1="6" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" x2="16" y1="14" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <circle cx="13" cy="11" r="1" fill="currentColor" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="13" cy="15" r="1" fill="currentColor" />
  </svg>
);

export const PremiumLineChart = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="m19 9-5 5-4-4-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="19" cy="9" r="2" fill="currentColor" />
    <circle cx="14" cy="14" r="2" fill="currentColor" />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
  </svg>
);

export const PremiumImageIcon = (props: IconProps) => (
  <svg {...getProps(props)}>
    <rect width="18" height="18" x="3" y="3" rx="4" ry="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="9" r="2" fill="currentColor" opacity="0.4" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
);

export const PremiumMessageSquare = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" opacity="0.15" />
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="9" x2="15" y1="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" x2="13" y1="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumPlay = (props: IconProps) => (
  <svg {...getProps(props)}>
    <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" opacity="0.15" />
    <polygon points="6 3 20 12 6 21 6 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PremiumSearch = (props: IconProps) => (
  <svg {...getProps(props)}>
    <circle cx="11" cy="11" r="8" fill="currentColor" opacity="0.15" />
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumMousePointerClick = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="m9 9 5 12 1.774-5.226L21 14 9 9z" fill="currentColor" opacity="0.15" />
    <path d="m9 9 5 12 1.774-5.226L21 14 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m16.071 16.071 4.243 4.243" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="m7.188 2.239.776 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656-2.12 2.122" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

export const PremiumFileText = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" fill="currentColor" opacity="0.15" />
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <line x1="16" x2="8" y1="13" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" x2="8" y1="17" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" x2="8" y1="9" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumWrench = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" opacity="0.15" />
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PremiumTags = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" fill="currentColor" opacity="0.15" />
    <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414l8.204 8.204a2.426 2.426 0 0 0 3.42 0l3.584-3.584a2.426 2.426 0 0 0 0-3.42z" fill="currentColor" opacity="0.15" />
    <path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414l8.204 8.204a2.426 2.426 0 0 0 3.42 0l3.584-3.584a2.426 2.426 0 0 0 0-3.42z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.5" cy="9.5" r=".5" fill="currentColor" />
  </svg>
);

export const PremiumBarChart3 = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <rect width="4" height="7" x="7" y="10" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect width="4" height="12" x="15" y="5" rx="1" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PremiumDownload = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
    <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" x2="12" y1="15" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PremiumTv = (props: IconProps) => (
  <svg {...getProps(props)}>
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" fill="currentColor" opacity="0.15" />
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="17 2 12 7 7 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
);

export const PremiumMessageCircle = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" fill="currentColor" opacity="0.15" />
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PremiumArrowRight = (props: IconProps) => (
  <svg {...getProps(props)}>
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
