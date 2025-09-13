import { QRCodeCanvas } from "qrcode.react";

export function QR({ value, size = 192 }: { value: string; size?: number }) {
	return (
		<div className="inline-block bg-white p-3 rounded shadow">
			<QRCodeCanvas value={value} size={size} includeMargin />
		</div>
	);
}
