import { SupabaseClient, createClient } from "@supabase/supabase-js";
export interface User {
    clientId: string
    eoa: string
    safeAddress:string
    deploymentTx: any
}
export interface Order {
  safeAddress: string
  txHash: string
  orderId: string,
  metadata: any
}
export class Database {
  databaseUrl = process.env.SUPABASE_URL || "";
  databasePassword = process.env.SUPABASE_API_KEY || "";
  client: SupabaseClient;
  constructor() {
    this.client = createClient(this.databaseUrl, this.databasePassword, {
      auth: {
        persistSession: false, //or true
      },
    });
  }
  async GetUser(clientId: string) {
    return await this.client.from("users").select().eq("clientId", clientId);
  }
  async CreateUser(user:User) {
    return await this.client.from("users").insert({
        clientId:user.clientId,
        userData:user
    })
  }
  async GetOrders(safeAddress: string) {
    return await this.client.from("orders").select().eq("safeAddress",safeAddress);
  }
  async CreateOrder(order:Order) {
    return await this.client.from("orders").insert(order)
  }
}
