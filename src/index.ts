import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { BigNumber, ethers } from "ethers";
import cors from "cors";
import { NewKeeperSigner, SignKeeperMessage } from "./keeper";
import { BuildSafeCallData, BuildUserOP, NewBundlerClient } from "./builder";
dotenv.config();
const app: Express = express();
app.use(express.json());
app.use(cors());
const keeper = NewKeeperSigner(
  new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
);
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
