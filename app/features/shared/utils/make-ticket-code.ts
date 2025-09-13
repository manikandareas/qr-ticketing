// Opaque, random, URL-safe
export function makeTicketCode(bytes = 24) {
	const arr = new Uint8Array(bytes);
	crypto.getRandomValues(arr);
	// base64url
	const b64 = btoa(String.fromCharCode(...arr))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
	return `t_${b64}`;
}
