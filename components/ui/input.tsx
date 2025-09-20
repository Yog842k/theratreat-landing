import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className = "", ...props }, ref) => (
		<input
			ref={ref}
			className={
				"block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 " +
				className
			}
			{...props}
		/>
	)
);

Input.displayName = "Input";

export default Input;
