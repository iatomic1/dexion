const file = Bun.file("./scripts/payload.json");
const json = await file.json();
console.log(json);

const url =
	"https://unhuntable-kristofer-unresident.ngrok-free.dev/webhooks/swaps/velar";
const token = process.env.CHAINHOOK_CONSUMER_TOKEN;

const response = await fetch(url, {
	method: "POST",
	body: JSON.stringify(json),
	headers: {
		Authorization: `Bearer ${token}`,
		"Content-type": "application/json",
	},
});

const data = await response.json();
