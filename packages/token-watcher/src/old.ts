//
// import { Hono } from "hono";
// import { logger } from "hono/logger";
// import { prettyJSON } from "hono/pretty-json";
// import { getFungibleContractId } from "./utils/getFungibleContractID";
// import { nanoid } from "nanoid";
//
// // sc.subscribeAddressTransactions(ADDRESSES.VELAR, (address, tx) => {
// //   if (tx.tx.tx_status === "success") {
// //     // refresh here
// //   }
// //   // upload to chainhook and track tx by ID
// // });
//
// const server = new Hono();
// server.use(logger());
// server.use(prettyJSON());
//
// server.post("/api/track", async (c) => {
//   try {
//     console.log("gotten");
//     const body = await c.req.json();
//
//     // Generate a random letter (a-z)
//     const randomLetter = String.fromCharCode(
//       97 + Math.floor(Math.random() * 26),
//     );
//
//     // Create filename using body.chainhook.uuid and random letter
//     const fileName = `${body.chainhook.uuid}${randomLetter}.json`;
//
//     // Write the data to a JSON file
//     await Bun.write(`${nanoid()}.json`, JSON.stringify(body, null, 2));
//
//     console.log(`Data written to ${fileName}`);
//     // const tx = body.tx;
//     // const contractId = getFungibleContractId(tx.post_conditions);
//
//     // console.log(contractId);
//     return c.json({ status: "success", fileName });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return c.json({ status: "error", message: error.message }, 500);
//   }
// });
//
// // server.post("/api/track", async (c) => {
// //   try {
// //     const body = await c.req.json();
// //     const tx = extractTransactionDetails(body);
// //     console.log(tx);
// //
// //     if (!tx) {
// //       return c.json(
// //         createResponse(false, 404, null, "Transaction not found"),
// //         404,
// //       );
// //     }
// //
// //     const chainhook = await getChainhook(tx?.uuid as string);
// //     if (!chainhook?.name) {
// //       return c.json(
// //         createResponse(false, 400, null, "Invalid chainhook data"),
// //         400,
// //       );
// //     }
// //     const memo = chainhook.name.split("|")[0];
// //     if (!memo) {
// //       return c.json(
// //         createResponse(false, 400, null, "Invalid memo format"),
// //         400,
// //       );
// //     }
// //     const userData = await getMemoData(redisClient as RedisClientType, memo);
// //     if (!userData) {
// //       return c.json(
// //         createResponse(false, 404, null, "User data not found"),
// //         404,
// //       );
// //     }
// //     if (userData.status !== "MEMPOOL") {
// //       return c.json(
// //         createResponse(false, 401, null, "Invalid transaction state"),
// //         401,
// //       );
// //     }
// //
// //     if (!tx.success || !tx.senderAddress || tx.amount === undefined) {
// //       return c.json(
// //         createResponse(false, 400, null, "Invalid transaction data"),
// //         400,
// //       );
// //     }
// //
// //     const tokenAmtToReceive = calculateTokensReceived(
// //       tx.amount,
// //       tokenConfig.presale.stxAmount,
// //       tokenConfig.presale.tokenAmount,
// //     );
// //
// //     if (tokenAmtToReceive === null) {
// //       return c.json(
// //         createResponse(
// //           false,
// //           400,
// //           null,
// //           "All input values must be greater than zero.",
// //         ),
// //         400,
// //       );
// //     }
// //     console.log("Token amount to receive:", tokenAmtToReceive);
// //
// //     const transferResult = await send(
// //       {
// //         amount: tokenAmtToReceive,
// //         receiverAddr: tx.senderAddress,
// //         fee: "0.001",
// //         memo: memo,
// //       },
// //       tokenConfig,
// //     );
// //
// //     if (transferResult.txid) {
// //       await Promise.all([
// //         sendDirectMessageWithEmbed(
// //           discordClient,
// //           userData.userId as string,
// //           memo,
// //           transferResult.txid,
// //         ),
// //         updateMemoStatus(redisClient as RedisClientType, memo, "SENT", {
// //           reason: "Token has been sent",
// //           tokenTransferTxid: transferResult.txid,
// //         }),
// //       ]);
// //       return c.json(
// //         createResponse(true, 200, {
// //           txid: transferResult.txid,
// //           tokenAmount: tokenAmtToReceive,
// //         }),
// //         200,
// //       );
// //     }
// //
// //     return c.json(
// //       createResponse(false, 500, null, "Token transfer failed"),
// //       500,
// //     );
// //   } catch (error) {
// //     console.error("API Error:", error);
// //     return c.json(
// //       createResponse(false, 500, null, "Internal server error"),
// //       500,
// //     );
// //   }
// // });
// export default {
//   port: 3009,
//   fetch: server.fetch,
// };
