import { SupabaseClient, createClient } from "@supabase/supabase-js";
export interface User {
    eoa: string
    safeAddress:string
    deploymentTx: any
}
export class Database {
  databaseUrl = process.env.SUPABASE_URL || "";
  databasePassword = process.env.SUPABASE_API_KEY || "";
  client: SupabaseClient;
  constructor() {
    console.log(process.env);
    this.client = createClient(this.databaseUrl, this.databasePassword, {
      auth: {
        persistSession: false, //or true
      },
    });
  }
  async GetUser(eoa: string) {
    return await this.client.from("users").select().eq("eoa", eoa);
  }
  async CreateUser(user:User) {
    return await this.client.from("users").insert({
        eoa:user.eoa,
        userData:user
    })
  }
}
