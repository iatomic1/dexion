import { NotifierClient } from "@repo/notifier";
import fs from "fs/promises";
import path from "path";
import { generateTransactionMessage } from "./src/parser";
import { generateTelegramMessage } from "./src/telegram-messages";

const CHAT_ID = "5979268431";
const notifier = new NotifierClient();

async function runTests() {
	const txExamplesDir = "./tx-examples";
	const files = await fs.readdir(txExamplesDir);

	for (const file of files) {
		if (file.endsWith(".json")) {
			console.log(`
--- Testing ${file} ---
`);
			const filePath = path.join(txExamplesDir, file);
			const fileContent = await fs.readFile(filePath, "utf-8");
			const txData = JSON.parse(fileContent);

			const structuredMessage = generateTransactionMessage(txData);
			console.log(
				"Structured Message:",
				JSON.stringify(structuredMessage, null, 2),
			);

			if (structuredMessage) {
				// Simulate Telegram message
				const telegramMessage = await generateTelegramMessage(
					structuredMessage,
					"TestWallet",
				);

				const buttons: NotificationButton[][] = [];
				if (structuredMessage.action === "Swap") {
					buttons.push([
						{
							text: "Trade on Dexion",
							url: `https://dexion.io/swap/${structuredMessage.details.sent.contractId}/${structuredMessage.details.received.contractId}`,
						},
						{
							text: "View on STXWatch",
							url: `https://stxwatch.com/txid/${structuredMessage.txId}`,
						},
					]);
				}

				await notifier.send("telegram", {
					message: telegramMessage,
					recipient: { id: CHAT_ID },
					parseMode: "HTML",
					buttons,
				});

				// Simulate PartyKit message
				// await notifier.send("partykit", {
				//   message: structuredMessage,
				//   recipient: { id: "test-room" },
				// });
			}
		}
	}
}

runTests().catch(console.error);
