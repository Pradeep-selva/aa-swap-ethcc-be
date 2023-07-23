
export interface orderTx {
    to: string,
    value:string,
    data: string,
}

export interface aggregatorResponse  {
  tx : orderTx
}

export const Get1inchRequest = async (chainId:number,safeAddress: string,fromAddress: string, toAddress:string, amount: string) : Promise<orderTx> => {
    console.log(safeAddress)
    const response = await (await fetch(`https://${process.env.ONEINCH_API}/v4.0/${chainId}/swap?fromTokenAddress=${fromAddress}&toTokenAddress=${toAddress}&amount=${amount}&fromAddress=${safeAddress}&slippage=${0.5}&disableEstimate=true`)).json() as unknown as aggregatorResponse 
    console.log(response)
    return {
        ...response.tx 
    }
}