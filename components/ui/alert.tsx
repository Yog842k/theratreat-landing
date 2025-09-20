import * as React from "react";

export function Alert({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={"flex items-start gap-2 rounded border border-blue-200 bg-blue-50 p-3 text-blue-800 " + className}>
			{children}
		</div>
	);
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
	return <div className="text-sm">{children}</div>;
}

export default Alert;
