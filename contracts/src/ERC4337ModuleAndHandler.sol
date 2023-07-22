// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity 0.8.19;

import "safe-contracts/contracts/libraries/SafeStorage.sol";
import "openzeppelin-contracts/utils/cryptography/ECDSA.sol";

import {UserOperation} from "./libs/UserOperation.sol";
import {IGnosisSafe, Enum} from "./interfaces/safe/IGnosisSafe.sol";

contract ERC4337ModuleAndHandler is SafeStorage {
    error InvalidSignature();

    address public immutable myAddress;
    address public immutable entryPoint;
    address internal immutable registeredKeeper;

    address internal constant SENTINEL_MODULES = address(0x1);
    uint256 internal constant ECDSA_SIGNATURE_LENGTH = 65;

    constructor(address entryPointAddress, address _registeredKeeper) {
        entryPoint = entryPointAddress;
        myAddress = address(this);

        registeredKeeper = _registeredKeeper;
    }

    function validateUserOp(UserOperation calldata userOp, bytes32, uint256 missingAccountFunds) external returns (uint256 validationData) {
        address payable safeAddress = payable(msg.sender);
        IGnosisSafe senderSafe = IGnosisSafe(safeAddress);

        if(userOp.signature.length != ECDSA_SIGNATURE_LENGTH) revert InvalidSignature();
        
        bytes32 opHash = keccak256(abi.encodePacked(userOp.sender, userOp.callData));
        bytes32 ethSignDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", opHash));

        address signer = ECDSA.recover(ethSignDigest, userOp.signature);

        if(signer != registeredKeeper) revert InvalidSignature();

        if (missingAccountFunds != 0) {
            senderSafe.execTransactionFromModule(
                entryPoint, 
                missingAccountFunds, 
                "", 
                Enum.Operation.Call
            );
        }

        return 0;
    }

    function execTransaction(address to, uint256 value, Enum.Operation callType, bytes calldata data) external payable {
        address payable safeAddress = payable(msg.sender);
        IGnosisSafe safe = IGnosisSafe(safeAddress);
        require(safe.execTransactionFromModule(to, value, data, callType), "tx failed");
    }

    function enableMyself() public {
        require(myAddress != address(this), "You need to DELEGATECALL, sir");

        // Module cannot be added twice.
        require(modules[myAddress] == address(0), "GS102");
        modules[myAddress] = modules[SENTINEL_MODULES];
        modules[SENTINEL_MODULES] = myAddress;
    }
}
