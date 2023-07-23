import { Client, Presets, UserOperationBuilder } from "userop";
import { MetaTransaction, encodeMulti } from "ethers-multisend";
import { BigNumber, ethers, utils } from "ethers";
import { SafeAAModuleInterface } from "./constants";
const MULTISEND_ADDRESS = ethers.utils.getAddress(
  "0x998739BFdAAdde7C933B942a68053933098f9EDa"
);
const ENTRYPOINT = ethers.utils.getAddress(
  "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
);
export const BuildSafeCallData = (transactions: MetaTransaction[]): string => {
  try {
    const encodedTransaction = encodeMulti(transactions, MULTISEND_ADDRESS);
    const target = ethers.utils.getAddress(encodedTransaction.to);
    const value = BigNumber.from(0);
    console.log(encodedTransaction);
    return SafeAAModuleInterface.encodeFunctionData("execTransaction", [
      transactions[0].to,
      transactions[0].value,
       0,
       transactions[0].data,
    ]);
  } catch (error) {
    console.log(error);
    return "";
  }
};
 const eip1559GasPrice = async (provider: ethers.providers.JsonRpcProvider) => {
  const [fee, block] = await Promise.all([
    provider.send("eth_maxPriorityFeePerGas", []),
    provider.getBlock("latest"),
  ]);

  const tip = ethers.BigNumber.from(fee);
  const buffer = tip.div(100).mul(40);
  const maxPriorityFeePerGas = tip.add(buffer);
  const maxFeePerGas = block.baseFeePerGas
    ? block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
    : maxPriorityFeePerGas;

  return { maxFeePerGas, maxPriorityFeePerGas };
};

export const BuildUserOP = async (
  safeAddress: string,
  callData: string,
  signature: string,
  nonce: number
): Promise<UserOperationBuilder> => {
  const rpc = new ethers.providers.JsonRpcProvider(
    process.env.ALCHEMY_URL || ""
  );
  const gasprice = (await rpc.getGasPrice()).mul(BigNumber.from(2))
  const {maxFeePerGas, maxPriorityFeePerGas} = await eip1559GasPrice(rpc)
  
  return new UserOperationBuilder().useDefaults({
    nonce: BigNumber.from(nonce),
    sender: safeAddress,
    callData,
    signature,
    maxFeePerGas: gasprice,
    preVerificationGas: "10000924",
    callGasLimit:"300000",
    maxPriorityFeePerGas: maxPriorityFeePerGas,
    verificationGasLimit: "1500000",
  });
};

export const NewBundlerClient = (): Promise<Client> => {
  return Client.init(process.env.RPC_URL || "", {
    entryPoint: ENTRYPOINT,
  });
};
