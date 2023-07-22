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
      target,
      value,
      encodedTransaction.operation || 0,
      encodedTransaction.data,
    ]);
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const BuildUserOP = (
  safeAddress: string,
  callData: string,
  signature: string
): UserOperationBuilder => {
  return new UserOperationBuilder().useDefaults({
    nonce:7,
    sender: safeAddress,
    callData,
    signature,
    maxFeePerGas: "4516700509",
    preVerificationGas: "10000924",
    maxPriorityFeePerGas: "203929",
    verificationGasLimit: "1500000",
  });
};

export const NewBundlerClient = (): Promise<Client> => {
  return Client.init(process.env.RPC_URL || "", {
    entryPoint: ENTRYPOINT,
  });
};
