import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import { BigNumber, ethers } from "ethers";
import cors from "cors";
import { NewKeeperSigner, SignKeeperMessage } from "./keeper";
import { BuildSafeCallData, BuildUserOP, NewBundlerClient } from "./builder";
import { Database, Order, User } from "./database";
import { FetchPrices, GetDefillamaPrefix } from "./defillama";

import { assets } from "./constants";
import { DeployAA } from "./deployer";
import { Get1inchRequest } from "./1inch";
const app: Express = express();
app.use(express.json());
app.use(cors());
const rpcProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_URL || ""
);
const keeper = NewKeeperSigner(rpcProvider);
const database = new Database();
app.get("/user/:clientId", async (req: Request, resp: Response) => {
  try {
    const user = await database.GetUser(req.params.clientId);
    resp.json({ data: user.data?.[0] || null });
  } catch (error) {
    resp.json({ err: error });
  }
});
app.get("/assets/:chainId", async (req: Request, resp: Response) => {
  try {
    let tokens = assets[req.params.chainId];
    if (!tokens) {
      resp.json({ err: "invalid chain-id" });
      return;
    }
    const prices = await FetchPrices(
      tokens.map((token) => token.address),
      req.params.chainId
    );
    tokens = tokens.map((token) => {
      return {
        ...token,
        prices: {
          default:
            prices?.coins[
              GetDefillamaPrefix(req.params.chainId) + ":" + token.address
            ]?.price || 0,
        },
      };
    });
    resp.json({ data: tokens });
  } catch (error) {
    console.log(error);
    resp.json({ err: error });
  }
});
app.post("/order", async (req: Request, resp: Response) => {
  try {
    const { clientId, safe, fromToken, toToken, amount } = req.body;
    const bundlerClient = await NewBundlerClient();
    const callData = await Get1inchRequest(
      137,
      safe,
      fromToken,
      toToken,
      BigNumber.from(amount).toString()
    );
    const safeCallData = BuildSafeCallData([
      {
        to: callData.to,
        value: callData.value,
        data: callData.data,
      },
    ]);
    const userOrder = await database.GetOrders(safe);
    console.log(userOrder.data);
    let nonce =
      userOrder.data?.filter((order) => {
        console.log(order.txHash);
        return order?.txHash != "";
      }).length || 0;
    const signature = await SignKeeperMessage(keeper, safe, safeCallData);
    const userOP = await BuildUserOP(safe, safeCallData, signature, nonce );
    const res = await bundlerClient.sendUserOperation(userOP, {
      onBuild: (op) => console.log("Signed UserOperation:", op),
    });
    console.log(`UserOpHash: ${res.userOpHash}`);
    console.log("Waiting for transaction...");
    const ev = await res.wait();
    const txHash = ev?.transactionHash ?? "";
    // const txHash = "test";
    const order: Order = {
      safeAddress: safe,
      txHash: txHash,
      orderId: ethers.utils.keccak256(ethers.utils.arrayify(callData.data)),
      metadata: {
        callData,
        ev,
        request: req.body,
        userOp: res,
      },
    };
    console.log(await database.CreateOrder(order));
    resp.json({ data: order });
  } catch (error) {
    console.log(error);
    resp.json({ err: error });
  }
});
app.get("/order/:safe", async (req: Request, resp: Response) => {
  console.log(req.params.safe);
  const ordersResp = await database.GetOrders(req.params.safe);
  resp.json({
    data:
      ordersResp.data?.map((order) => {
        return {
          ...order,
          logo: "https://brahma-static.s3.us-east-2.amazonaws.com/Asset/Asset%3DUSDC.svg",
        };
      }) || [],
  });
});
app.post("/user/", async (req: Request, resp: Response) => {
  try {
    const { clientId } = req.body;
    if (!clientId) {
      resp.json({ err: "no clientId defined" });
    }
    const user = await database.GetUser(clientId);
    if (!user.data) {
      resp.json({ err: "no data defined" });
      return;
    }
    if (user.data?.length == 0) {
      const deploymentMetadata = await DeployAA(keeper);
      console.log(deploymentMetadata);
      await deploymentMetadata.transaction.wait();
      const receipt = await rpcProvider.getTransactionReceipt(
        deploymentMetadata.transaction.hash
      );
      console.log(receipt);
      const safeAddress = receipt.logs[1].address;
      const newUser: User = {
        clientId: clientId,
        eoa: deploymentMetadata.pseudoOwner,
        safeAddress: safeAddress,
        deploymentTx: receipt,
      };
      const create = await database.CreateUser(newUser);
      console.log(create);
      // const topuptxn = await TopupSafe(safeAddress, keeper);
      // console.log(topuptxn);
      // await topuptxn.wait();
      resp.json({ data: newUser });
      return;
    }
    resp.json({ data: user.data[0] });
    return;
  } catch (error) {
    console.log(error);
    resp.json({ err: error });
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});
