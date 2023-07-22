import { Wallet } from "ethers"
import { DeployerInterface, SAFE_DEPLOYER_ADDRESS } from "./constants"



export const DeployAA =  async(eoa: string, keeper: Wallet) => {
    const txData = DeployerInterface.encodeFunctionData("deployConsoleAccount",[[eoa],1,"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"])
    const transaction = await keeper.sendTransaction({
        to:SAFE_DEPLOYER_ADDRESS,
        data:txData,
        gasLimit:1000000,
    })
    return transaction
}