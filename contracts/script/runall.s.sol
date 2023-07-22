// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "src/SafeDeployer.sol";


contract DeployProtocol is Script {
    address constant broadcaster = 0xAE75B29ADe678372D77A8B41225654138a7E6ff1;
    address constant entrypoint = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;

    function run() public {
        vm.startBroadcast();

        ERC4337ModuleAndHandler handler = new ERC4337ModuleAndHandler(entrypoint, broadcaster);
        SafeDeployer deployer = new SafeDeployer(address(handler));

        address[] memory owners = new address[](1);
        owners[0] = address(broadcaster);
        uint256 threshold = 1;

        address safe = deployer.deployConsoleAccount(owners, threshold);
        address[] memory _owners = IGnosisSafe(safe).getOwners();
        
        console.log("Safe deployer: %s", address(deployer));
        console.log("AA Safe: %s", safe);
        console.log("Owner:", _owners[0]);
        console.log('4337 module handler', address(handler));

        vm.stopBroadcast();
    }
}