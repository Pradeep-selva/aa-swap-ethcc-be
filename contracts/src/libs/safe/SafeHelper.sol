// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.19;

import "../../interfaces/safe/IGnosisSafe.sol";
import "../../interfaces/safe/Types.sol";

library SafeHelper {
    error InvalidMultiSendCall(uint256);
    error InvalidMultiSendInput();
    error SafeExecTransactionFailed();

    /**
     * @notice Executes a transaction on a safe
     *
     * @dev Allows any contract using this library to execute a transaction on a safe
     *  Assumes the contract using this method is the owner of the safe
     *  Also assumes the safe is a single threshold safe
     *  This uses pre-validated signature scheme used by gnosis
     *
     * @param safe Safe address
     * @param target Target contract address
     * @param op Safe Operation type
     * @param data Transaction data
     */
    function _executeOnSafe( address safe, address target, Enum.Operation op, bytes memory data) internal {
        bool success = IGnosisSafe(safe).execTransaction(
            address(target), // to
            0, // value
            data, // data
            op, // operation
            0, // safeTxGas
            0, // baseGas
            0, // gasPrice
            address(0), // gasToken
            payable(address(0)), // refundReceiver
            _generateSingleThresholdSignature(msg.sender) // signatures
        );

        if (!success) revert SafeExecTransactionFailed();
    }

    /**
     * @notice Generates a pre-validated signature for a safe transaction
     * @dev Refer to https://docs.safe.global/learn/safe-core/safe-core-protocol/signatures#pre-validated-signatures
     * @param owner Owner of the safe
     */
    function _generateSingleThresholdSignature(address owner) internal pure returns (bytes memory) {
        bytes memory signatures = abi.encodePacked(
            bytes12(0), // Padding for signature verifier address
            bytes20(owner), // Signature Verifier
            bytes32(0), // Position of extra data bytes (last set of data)
            bytes1(hex"01") // Signature Type - 1 (presigned transaction)
        );
        return signatures;
    }

    /**
     * @notice Packs multiple executables into a single bytes array compatible with Safe's MultiSend contract
     * @dev Reference contract at https://github.com/safe-global/safe-contracts/blob/main/contracts/libraries/MultiSend.sol
     * @param _txns Array of executables to pack
     */
    function _packMultisendTxns(Types.Executable[] memory _txns) internal pure returns (bytes memory packedTxns) {
        uint256 len = _txns.length;
        if (len == 0) revert InvalidMultiSendInput();

        uint256 i = 0;
        do {
            // Enum.Operation.Call is 0
            uint8 call = uint8(Enum.Operation.Call);
            if (_txns[i].callType == Types.CallType.DELEGATECALL) {
                call = uint8(Enum.Operation.DelegateCall);
            } else if (_txns[i].callType == Types.CallType.STATICCALL) {
                revert InvalidMultiSendCall(i);
            }

            uint256 calldataLength = _txns[i].data.length;

            bytes memory encodedTxn = abi.encodePacked(
                bytes1(call), bytes20(_txns[i].target), bytes32(_txns[i].value), bytes32(calldataLength), _txns[i].data
            );

            if (i != 0) {
                // If not first transaction, append to packedTxns
                packedTxns = abi.encodePacked(packedTxns, encodedTxn);
            } else {
                // If first transaction, set packedTxns to encodedTxn
                packedTxns = encodedTxn;
            }

            unchecked {
                ++i;
            }
        } while (i < len);
    }
}
