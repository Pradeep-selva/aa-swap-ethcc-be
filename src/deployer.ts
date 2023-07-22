import { Wallet, ethers } from "ethers";
import { DeployerInterface, SAFE_DEPLOYER_ADDRESS } from "./constants";

export interface DeployedAA {
  transaction: ethers.providers.TransactionResponse;
  pseudoOwner: string;
}

export const DeployAA = async (keeper: Wallet): Promise<DeployedAA> => {
  const pseudoOwner = ethers.Wallet.createRandom();
  const txData = DeployerInterface.encodeFunctionData("deployAaAccount", [
    [pseudoOwner.address],
    1,
  ]);
  const transaction = await keeper.sendTransaction({
    to: SAFE_DEPLOYER_ADDRESS,
    data: txData,
    gasLimit: 1000000,
  });

  return { transaction, pseudoOwner: pseudoOwner.address };
};
