import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { BigNumber, ethers } from "ethers";
import cors from "cors";
import { NewKeeperSigner, SignKeeperMessage } from "./keeper";
import { BuildSafeCallData, BuildUserOP, NewBundlerClient } from "./builder";
import { Database, User } from "./database";
import { DeployAA } from "./deployer";
import { assets } from "./constants";
import { TopupSafe } from "./topup";
dotenv.config();
const app: Express = express();
app.use(express.json());
app.use(cors());
const rpcProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const keeper = NewKeeperSigner(rpcProvider);
const database = new Database();
app.get("/user/:eoa", async (req: Request, resp: Response) => {
  try {
    const user = await database.GetUser(req.params.eoa);
    resp.json({ data: user.data?.[0] });
  } catch (error) {
    resp.json({ err: error });
  }
});
app.get("/assets/:chainId", async (req: Request, resp: Response) => {
  try {
    const tokens = assets[req.params.chainId];
    if (!tokens) {
      resp.json({ err: "invalid chain-id" });
      return;
    }
    resp.json({ data: tokens });
  } catch (error) {
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
    const { eoa } = req.body;
    console.log(eoa);
    if (!eoa) {
      resp.json({ err: "no eao defined" });
    }
    const user = await database.GetUser(eoa);
    if (!user.data) {
      resp.json({ err: "no data defined" });
      return;
    }
    if (user.data?.length == 0) {
      const transaction = await DeployAA(eoa, keeper);
      console.log(transaction);
      await transaction.wait();
      const receipt = await rpcProvider.getTransactionReceipt(transaction.hash);
      const safeAddress = receipt.logs[0].address;
      const newUser: User = {
        eoa: eoa,
        safeAddress: safeAddress,
        deploymentTx: receipt,
      };
      await database.CreateUser(newUser);
      const topuptxn = await TopupSafe(safeAddress, keeper);
      console.log(topuptxn);
      await topuptxn.wait();
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
