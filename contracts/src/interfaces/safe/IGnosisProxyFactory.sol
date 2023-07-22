// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;

interface IGnosisProxyFactory {
    event ProxyCreation(address proxy, address singleton);

    function calculateCreateProxyWithNonceAddress(address _singleton, bytes memory initializer, uint256 saltNonce)
        external
        returns (address proxy);

    function createProxy(address singleton, bytes memory data) external returns (address proxy);

    function createProxyWithCallback(address _singleton, bytes memory initializer, uint256 saltNonce, address callback)
        external
        returns (address proxy);

    function createProxyWithNonce(address _singleton, bytes memory initializer, uint256 saltNonce)
        external
        returns (address proxy);

    function proxyCreationCode() external pure returns (bytes memory);

    function proxyRuntimeCode() external pure returns (bytes memory);
}
