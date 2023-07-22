import { Wallet, ethers } from "ethers";

export const NewKeeperSigner = (
  provider: ethers.providers.JsonRpcProvider
): ethers.Wallet => {
  return new ethers.Wallet(process.env.KEEPER_PRIVATE_KEY || "", provider);
};

export const SignKeeperMessage = (
  signer: Wallet,
  sender: string,
  callData: string
): Promise<string> => {
  const message = ethers.utils.keccak256(
    ethers.utils.solidityPack(["address", "bytes"], [sender, callData])
  );
  console.log("message", message);
  return signer.signMessage(ethers.utils.arrayify(message));
};
