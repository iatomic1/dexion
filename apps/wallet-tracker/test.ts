#!/usr/bin/env bun

/**
 * Script to parse transaction examples from JSON files
 * Usage: bun run parse-examples.ts
 */

import {
	type ParsedTransaction,
	TransactionParser,
} from "@dexion/tokens/parser";
import type { MempoolTransaction } from "@stacks/blockchain-api-client";
import { readdir, readFile, writeFile } from "fs/promises";
import { basename, extname, join } from "path";

interface ParseResult {
	filename: string;
	success: boolean;
	transaction?: ParsedTransaction;
	error?: string;
	originalTx?: MempoolTransaction;
}

interface Summary {
	totalFiles: number;
	successfulParsed: number;
	failed: number;
	protocols: Record<string, number>;
	actions: Record<string, number>;
	errors: string[];
}

class ExampleParser {
	private parser: TransactionParser;
	private results: ParseResult[] = [];

	constructor() {
		this.parser = new TransactionParser();
	}

	async parseExamples(txExamplesDir = "./tx-examples"): Promise<void> {
		try {
			console.log(`🔍 Scanning directory: ${txExamplesDir}`);
			const files = await readdir(txExamplesDir);
			const jsonFiles = files.filter(
				(file) => extname(file).toLowerCase() === ".json",
			);

			if (jsonFiles.length === 0) {
				console.log("❌ No JSON files found in the directory");
				return;
			}

			console.log(`📁 Found ${jsonFiles.length} JSON files`);

			// Process files concurrently but with some limit to avoid overwhelming
			const batchSize = 5;
			for (let i = 0; i < jsonFiles.length; i += batchSize) {
				const batch = jsonFiles.slice(i, i + batchSize);
				const batchPromises = batch.map((file) =>
					this.parseFile(txExamplesDir, file),
				);
				const batchResults = await Promise.allSettled(batchPromises);

				// Handle results
				batchResults.forEach((result, index) => {
					if (result.status === "fulfilled") {
						this.results.push(result.value);
					} else {
						this.results.push({
							filename: batch[index],
							success: false,
							error: `Failed to process file: ${result.reason}`,
						});
					}
				});

				// Progress indicator
				console.log(
					`⏳ Processed ${Math.min(i + batchSize, jsonFiles.length)}/${jsonFiles.length} files`,
				);
			}

			await this.generateReport();
			await this.saveResults();
		} catch (error) {
			console.error("❌ Error parsing examples:", error);
			process.exit(1);
		}
	}

	private async parseFile(dir: string, filename: string): Promise<ParseResult> {
		const filepath = join(dir, filename);

		try {
			const content = await readFile(filepath, "utf-8");

			// Try to parse JSON
			let jsonData: any;
			try {
				jsonData = JSON.parse(content);
			} catch (parseError) {
				return {
					filename,
					success: false,
					error: `Invalid JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
				};
			}

			// Handle different JSON structures
			let transactions: MempoolTransaction[];

			if (Array.isArray(jsonData)) {
				// Array of transactions
				transactions = jsonData;
			} else if (jsonData.results && Array.isArray(jsonData.results)) {
				// API response format with results array
				transactions = jsonData.results;
			} else if (jsonData.tx_id) {
				// Single transaction object
				transactions = [jsonData];
			} else {
				return {
					filename,
					success: false,
					error:
						"Unrecognized JSON structure - expected transaction(s) or API response format",
				};
			}

			if (transactions.length === 0) {
				return {
					filename,
					success: false,
					error: "No transactions found in file",
				};
			}

			// Parse transactions
			const parsedTransactions = this.parser.parseMany(transactions);

			if (parsedTransactions.length === 0) {
				return {
					filename,
					success: false,
					error: "No transactions could be parsed successfully",
					originalTx: transactions[0], // Include first tx for debugging
				};
			}

			return {
				filename,
				success: true,
				transaction: parsedTransactions[0], // Return first parsed transaction
				originalTx: transactions[0],
			};
		} catch (error) {
			return {
				filename,
				success: false,
				error: `File processing error: ${error instanceof Error ? error.message : "Unknown error"}`,
			};
		}
	}

	private async generateReport(): Promise<void> {
		const summary: Summary = {
			totalFiles: this.results.length,
			successfulParsed: 0,
			failed: 0,
			protocols: {},
			actions: {},
			errors: [],
		};

		this.results.forEach((result) => {
			if (result.success && result.transaction) {
				summary.successfulParsed++;

				// Count protocols
				const protocol = result.transaction.protocol;
				summary.protocols[protocol] = (summary.protocols[protocol] || 0) + 1;

				// Count actions
				const action = result.transaction.action;
				summary.actions[action] = (summary.actions[action] || 0) + 1;
			} else {
				summary.failed++;
				if (result.error) {
					summary.errors.push(`${result.filename}: ${result.error}`);
				}
			}
		});

		// Print summary
		console.log("\n" + "=".repeat(60));
		console.log("📊 PARSING SUMMARY");
		console.log("=".repeat(60));
		console.log(`📁 Total files processed: ${summary.totalFiles}`);
		console.log(`✅ Successfully parsed: ${summary.successfulParsed}`);
		console.log(`❌ Failed to parse: ${summary.failed}`);
		console.log(
			`📈 Success rate: ${((summary.successfulParsed / summary.totalFiles) * 100).toFixed(1)}%`,
		);

		if (Object.keys(summary.protocols).length > 0) {
			console.log("\n🏛️  PROTOCOLS DETECTED:");
			Object.entries(summary.protocols)
				.sort(([, a], [, b]) => b - a)
				.forEach(([protocol, count]) => {
					console.log(`   ${protocol}: ${count} transactions`);
				});
		}

		if (Object.keys(summary.actions).length > 0) {
			console.log("\n⚡ ACTIONS DETECTED:");
			Object.entries(summary.actions)
				.sort(([, a], [, b]) => b - a)
				.forEach(([action, count]) => {
					console.log(`   ${action}: ${count} transactions`);
				});
		}

		if (summary.errors.length > 0) {
			console.log("\n❌ ERRORS:");
			summary.errors.slice(0, 10).forEach((error) => {
				// Show only first 10 errors
				console.log(`   ${error}`);
			});

			if (summary.errors.length > 10) {
				console.log(`   ... and ${summary.errors.length - 10} more errors`);
			}
		}

		console.log("=".repeat(60));
	}

	private async saveResults(): Promise<void> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const outputFile = `./parse-results-${timestamp}.json`;

		const output = {
			timestamp: new Date().toISOString(),
			summary: {
				totalFiles: this.results.length,
				successfulParsed: this.results.filter((r) => r.success).length,
				failed: this.results.filter((r) => !r.success).length,
			},
			results: this.results.map((result) => ({
				filename: result.filename,
				success: result.success,
				error: result.error,
				transaction: result.transaction,
				// Include original tx only for failed cases (for debugging)
				...(result.success ? {} : { originalTx: result.originalTx }),
			})),
		};

		try {
			await writeFile(outputFile, JSON.stringify(output, null, 2));
			console.log(`💾 Results saved to: ${outputFile}`);
		} catch (error) {
			console.error("❌ Failed to save results:", error);
		}
	}

	// Method to get successful results for further processing
	getSuccessfulResults(): ParsedTransaction[] {
		return this.results
			.filter((r) => r.success && r.transaction)
			.map((r) => r.transaction!);
	}

	// Method to get failed results for debugging
	getFailedResults(): ParseResult[] {
		return this.results.filter((r) => !r.success);
	}
}

// Main execution
async function main() {
	const txExamplesDir = process.argv[2] || "./tx-examples";

	console.log("🚀 Starting transaction parser...");
	console.log(`📂 Using directory: ${txExamplesDir}`);

	const exampleParser = new ExampleParser();
	await exampleParser.parseExamples(txExamplesDir);

	console.log("\n✨ Done!");
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	console.log("\n👋 Graceful shutdown...");
	process.exit(0);
});

// Run if this file is executed directly
if (import.meta.main) {
	main().catch((error) => {
		console.error("💥 Fatal error:", error);
		process.exit(1);
	});
}

// Export for use as a module
export { ExampleParser };
