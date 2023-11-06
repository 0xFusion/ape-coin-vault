# ApeCoinVault

This repository contains smart contracts for the ApeCoin Vault. A ERC4626 compliant vault for ApeCoin auto-compounded staking. ERC4626 is the "Tokenized Vault Standard" as defined in https://eips.ethereum.org/EIPS/eip-4626

## ApeCoinVault address on Ethereum Goerli

https://goerli.etherscan.io/address/0xEb35a868adF9DA254daFD571fEA2b836Eec36e0e

### Installation

```console
$ yarn
```

### Compile

```console
$ yarn compile
```

This task will compile all smart contracts in the `contracts` directory.
ABI files will be automatically exported in `artifacts` directory.

### Testing

```console
$ yarn test
```

### Code coverage

```console
$ yarn coverage
```

The report will be printed in the console and a static website containing full report will be generated in `coverage` directory.

### Code style

```console
$ yarn prettier
```

### Verify & Publish contract source code

```console
$ npx hardhat  verify --network mainnet $CONTRACT_ADDRESS $CONSTRUCTOR_ARGUMENTS
```
