import * as React from "react";

export function RadioGroup({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode; }) {
	return <div role="radiogroup" onChange={(e) => {
		const t = e.target as HTMLInputElement;
		if (t?.type === "radio" && t.name) onValueChange?.(t.value);
	}}>{children}</div>;
}

export function RadioGroupItem({ id, value }: { id: string; value: string; }) {
	return (
		<input id={id} name={"radio-" + id.split(" ").join("-")} type="radio" value={value} className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
	);
}

export default RadioGroup;
