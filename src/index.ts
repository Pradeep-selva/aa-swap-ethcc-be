import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import { BigNumber, ethers } from "ethers";
import cors from "cors";
import { NewKeeperSigner, SignKeeperMessage } from "./keeper";
import { BuildSafeCallData, BuildUserOP, NewBundlerClient } from "./builder";
import { Database, User } from "./database";
import { FetchPrices, GetDefillamaPrefix } from "./defillama";

import { assets } from "./constants";
import { DeployAA } from "./deployer";
const app: Express = express();
app.use(express.json());
app.use(cors());
const rpcProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
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
    })
    resp.json({ data: tokens });
  } catch (error) {
    console.log(error);
    resp.json({ err: error });
  }
});
app.post("/order", async (req: Request, resp: Response) => {
  return resp.json({
    data: {
      orderId: "0x0000000001",
      txHash: "0x0000000002",
    },
  });
});
app.get("/order/:safe", async (req: Request, resp: Response) => {
  console.log(req.params.safe);
  return resp.json({
    data: [
      {
        orderId: "0x0000000001",
        txHash: "0x0000000002",
      },
    ],
  });
});
app.post("/user/", async (req: Request, resp: Response) => {
  try {
    const { clientId } = req.body;
    if (!clientId) {
      resp.json({ err: "no eao defined" });
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
      const safeAddress = receipt.logs[0].address;
      const newUser: User = {
        clientId: clientId,
        eoa: deploymentMetadata.pseudoOwner,
        safeAddress: safeAddress,
        deploymentTx: receipt,
      };
      const create = await database.CreateUser(newUser);
      console.log(create)
      // const topuptxn = await TopupSafe(safeAddress, keeper);
      // console.log(topuptxn);
      // await topuptxn.wait();
      resp.json({ data: newUser });
      return;
    }
    resp.json({ data: user.data[0] });
    return;
  } catch (error) {
    resp.json({ err: error });
  }
});
app.get("/send", async (req: Request, resp: Response) => {
  const safe = "0x10E7F21665Ee8C16e7A9d192029DeE8bcA162Cee";
  const bundlerClient = await NewBundlerClient();
  const safeCallData = BuildSafeCallData([
    {
      to: "0x0405d9d1443DFB051D5e8E231e41C911Dc8393a4",
      value: BigNumber.from("10000000").toString(),
      data: "0x",
    },
    {
      to: "0x5938551775B3c6F275EB3212B35b537fE4502dcD",
      value: BigNumber.from("20000000").toString(),
      data: "0x",
    },
  ]);
  const signature = await SignKeeperMessage(keeper, safe, safeCallData);
  const userOP = BuildUserOP(safe, safeCallData, signature);
  const res = await bundlerClient.sendUserOperation(userOP, {
    onBuild: (op) => console.log("Signed UserOperation:", op),
  });
  console.log(`UserOpHash: ${res.userOpHash}`);

  console.log("Waiting for transaction...");
  const ev = await res.wait();
  console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
  resp.json({ safe, safeCallData, signature, ev });
});

app.listen(process.env.PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});
