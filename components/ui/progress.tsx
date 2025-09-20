export function Progress({ value = 0, className = "" }: { value?: number; className?: string }) {
	const clamped = Math.max(0, Math.min(100, value));
	return (
		<div className={"h-2 w-full rounded bg-gray-200 " + className}>
			<div className="h-2 rounded bg-blue-600" style={{ width: `${clamped}%` }} />
		</div>
	);
}

export default Progress;
