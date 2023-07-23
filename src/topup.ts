import { BigNumber, Wallet } from "ethers";

// const TOPUP_AMOUNT = "2000000000000000000"
export const TOPUP_AMOUNT = BigNumber.from(1e9).mul(1e9).mul(5);
export const TopupSafe = async (safeAddress: string, funder: Wallet) => {
  const transaction = await funder.sendTransaction({
    to: safeAddress,
    data: "0x",
    value: TOPUP_AMOUNT._hex,
    gasLimit: 1000000,
  });
  return transaction;
};
