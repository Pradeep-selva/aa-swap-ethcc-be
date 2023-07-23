# 1Wallet Infra - Gasless, Seedless HID Based Web3 Wallet

1Wallet Infra serves as the foundation for both 1Wallet contracts and the backend server, working in tandem to deliver the exceptional gasless wallet experience. It excels at handling abstract account transaction relaying through bundler and deployments in a seamless, self-custodial manner, where account authentication occurs via HID face ID/TouchID instead of seed phrases. Leveraging the SAFE wallet ecosystem, it ensures secure and efficient transaction executions.

1Wallet's seamless UI can be found, **[HERE](https://github.com/Pradeep-selva/aa-swap-ethcc-fe)**.

## Introduction

1Wallet is a gasless web3 wallet that utilizes the Safe {WALLET} and the Safe AA SDK, enabling users to perform various actions such as swaps on platforms like 1inch. The wallet's core feature is the utilization of WebAuthn for authentication, allowing users to authenticate requests using FaceID or TouchID without the need to store any private keys or seed phrases.

## Key Features

- Gasless Transactions: 1Wallet enables gasless transactions by relaying calldata to the entrypoint for execution on the Safe wallet, saving users from paying gas fees for their transactions.

- Secure Authentication: WebAuthn is used for authentication, ensuring a high level of security as the user's private keys are stored in the device's secure enclave.

- Swaps on 1inch: The demo showcases the capability of the wallet by enabling users to place swaps on 1inch in a gasless fashion.

- Self-Custodial and Trustless: 1Wallet allows users to manage their assets and generate orders via their devices in a self-custodial and trustless manner.

## Dependencies

1Wallet is built on the following technologies:

- [Next.js](https://github.com/vercel/next.js): A React framework for building server-side rendered and static websites. ([UI](https://github.com/Pradeep-selva/aa-swap-ethcc-fe))

- [Safe {WALLET}](https://github.com/safe-global): Provides the foundation for the gasless transaction modules and abstract automated wallet management.

- [WebAuthn](https://github.com/passwordless-id/webauthn): Enables secure and convenient authentication using FaceID or TouchID.

- [Stackup Bundler](https://github.com/stackup-wallet/stackup-bundler): Used for relaying transactions to entrypoint for execution.

- [1inch](https://docs.1inch.io/docs/aggregation-protocol/introduction): The 1inch API v5, Pathfinder, is an advanced discovery and routing algorithm that facilitates asset exchanges at the best rates by finding efficient paths for token swaps across protocols and market depths.

- [Supabase](https://supabase.com/): It is utilized as the robust database solution to store user metadata, orders history, and other relevant information for seamless retrieval and management in the 1Wallet application.

## Usage

To use 1Wallet Server, follow the steps below:

1. Clone the repository to your local machine.
2. Install the necessary dependencies using `yarn`.
3. Create an env with -

```env
PORT=
SUPABASE_URL=
SUPABASE_API_KEY=
RPC_URL=
```

4. Start the development server with `yarn watch`
5. To test this on a live build, run `yarn start`
6. Visit the local development URL in your web browser to access the 1Wallet server.

To use 1Wallet contracts, follow the steps below:

1. Clone the repository to your local machine.
2. Install the necessary dependencies using `forge install`
3. Create an env with -

```env
MAINNET_RPC=
MAINNET_PRIVATE_KEY=
```

4. To perform local deployments to test, from root directory run `make demo_account`

## Demo

This product's demo can be viewed [here](https://ethglobal.com/showcase/1wallet-3e5z6).

## License

[MIT](LICENSE) © 1Wallet
