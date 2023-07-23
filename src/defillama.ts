interface coinMetadata {
    price: number
}
interface llamaResponse {
    coins: Map<string,coinMetadata>
}
export const GetDefillamaPrefix =  (chainId:number) => {
    return chainId == 137 ? "polygon":"ethereum"
} 
export const FetchPrices = async (tokens: string[],chainId: number): Promise<llamaResponse> => {
    const prefix = GetDefillamaPrefix(chainId)
    const url = 'https://coins.llama.fi/prices/current/' + tokens.map(token => prefix+":"+token).join(',') 
    const response  = await (await fetch(url)).json() as unknown as llamaResponse
    return response

}