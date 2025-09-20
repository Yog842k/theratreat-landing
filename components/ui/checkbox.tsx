import * as React from "react";

export interface CheckboxProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
	onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({ onCheckedChange, className = "", checked, ...props }: CheckboxProps) {
	return (
		<input
			type="checkbox"
			className={
				"h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 " + className
			}
			checked={!!checked}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			{...props}
		/>
	);
}

export default Checkbox;
