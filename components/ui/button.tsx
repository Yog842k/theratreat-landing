import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: "px-3 py-1 text-sm",
  md: "px-5 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

export const Button: React.FC<ButtonProps> = ({ size = "md", children, className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${sizeClasses[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;
