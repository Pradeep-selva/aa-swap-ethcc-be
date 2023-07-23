// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.19;

import "forge-std/console.sol";

import "./interfaces/safe/IGnosisSafe.sol";
import "./interfaces/safe/IGnosisProxyFactory.sol";
import "./interfaces/safe/IGnosisMultiSend.sol";

import {Types, SafeHelper} from "./libs/safe/SafeHelper.sol";
import "./ERC4337ModuleAndHandler.sol";
import "./interfaces/aa/IStakeManager.sol";

/**
 * @title SafeDeployer
 * @notice This contract is responsible for deploying and configuring Gnosis Safe wallets.
 * @dev It deploys safe wallet with preconfigured 4337 modules & fallback handler 
 * set to support account abstraction
 */
contract SafeDeployer {
    error InvalidOwner();
    error OnlySubAccountRegistry();
    error OnlyOwner();
    error FundingAaAccountFailed();

    event DeployedAaAccount(address indexed owner, address indexed account);

    address public immutable module;

    address public constant GNOSIS_MULTISEND = 0x998739BFdAAdde7C933B942a68053933098f9EDa;
    address public constant AA_ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    string public constant VERSION = "1.08";

    mapping(bytes32 ownersHash => uint96 safeCount) public ownerSafeCount;

    constructor(address _module) {
        module = _module;
    }

    function deployAaAccount(address[] memory _owners, uint256 _threshold)
        external
        payable
        returns (address)
    {
        address safe = _createSafe(_owners, _setupSafeAsAaAccount(_owners, _threshold));
        
        uint256 safeTopup = 0.2 ether;
        
        (bool success,) = safe.call{value: safeTopup}("");

        if (!success) revert FundingAaAccountFailed();
        
        IStakeManager(AA_ENTRYPOINT).depoositFor{value: msg.value - safeTopup}(safe);

        emit DeployedAaAccount(_owners[0], safe);
        return (safe);
    }


    function _createSafe(address[] memory _owners, bytes memory _initializer) internal returns (address) {
        address gnosisProxyFactory = 0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67;
        address gnosisSafeSingleton = 0xc962E67D9490E154D81181879ddf4CD3b65D2132;

        bytes32 ownersHash = keccak256(abi.encode(_owners));

        address safe = IGnosisProxyFactory(gnosisProxyFactory).createProxyWithNonce(
            gnosisSafeSingleton, _initializer, _genNonce(ownersHash)
        );
        return safe;
    }

    function _setupSafeAsAaAccount(address[] memory _owners, uint256 _threshold)
        internal
        view
        returns (bytes memory initializer)
    {
        Types.Executable[] memory txns = new Types.Executable[](1);        

        txns[0] = Types.Executable({
            callType: Types.CallType.DELEGATECALL,
            target: address(module),
            value: 0,
            data: abi.encodeCall(ERC4337ModuleAndHandler.enableMyself, ())
        });

        initializer = abi.encodeCall(
            IGnosisSafe.setup,
            (
                _owners,
                _threshold,
                GNOSIS_MULTISEND, // target
                abi.encodeCall(IGnosisMultiSend.multiSend, (SafeHelper._packMultisendTxns(txns))), //data
                address(module), //fallback handler
                address(0),
                0,
                address(0)
            )
        );
    }

    function _genNonce(bytes32 _ownersHash) internal returns (uint256) {
        uint96 currentNonce = ownerSafeCount[_ownersHash]++;
        return uint256(keccak256(abi.encodePacked(_ownersHash, currentNonce, VERSION)));
    }

}
