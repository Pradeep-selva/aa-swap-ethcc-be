import { ethers } from "ethers";

export const SAFE_DEPLOYER_ADDRESS = "0x797c1228Ec6EECD03E16d40dD722add49E5209EE"

const SafeAAModuleABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "entryPointAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_registeredKeeper",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidSignature",
    type: "error",
  },
  {
    inputs: [],
    name: "enableMyself",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "entryPoint",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "callType",
        type: "uint8",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "execTransaction",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "myAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "sender",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "initCode",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
          {
            internalType: "uint256",
            name: "callGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "verificationGasLimit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "preVerificationGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxFeePerGas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriorityFeePerGas",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "paymasterAndData",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct UserOperation",
        name: "userOp",
        type: "tuple",
      },
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "missingAccountFunds",
        type: "uint256",
      },
    ],
    name: "validateUserOp",
    outputs: [
      {
        internalType: "uint256",
        name: "validationData",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const SafeMultiSendABI = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "transactions",
        type: "bytes",
      },
    ],
    name: "multiSend",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const DeployerAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_module",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "InvalidMultiSendCall",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMultiSendInput",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlySubAccountRegistry",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "consoleAddress",
        type: "address",
      },
    ],
    name: "brahConsoleDeployed",
    type: "event",
  },
  {
    inputs: [],
    name: "GNOSIS_MULTISEND",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "VERSION",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_owners",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_threshold",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_feeToken",
        type: "address",
      },
    ],
    name: "deployConsoleAccount",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "module",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "ownersHash",
        type: "bytes32",
      },
    ],
    name: "ownerSafeCount",
    outputs: [
      {
        internalType: "uint96",
        name: "safeCount",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
export const SafeAAModuleInterface = new ethers.utils.Interface(
  SafeAAModuleABI
);
export const SafeMultiSendInterface = new ethers.utils.Interface(
  SafeMultiSendABI
);

export const DeployerInterface = new ethers.utils.Interface(DeployerAbi)