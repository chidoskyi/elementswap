// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ElementToken
 * @notice ERC-20 deployed by ElementTokenFactory.
 *         Full supply minted to factory on construction so factory can
 *         split tokens between liquidity pool and the token owner atomically.
 *         After factory finishes, ownership is transferred to the deployer wallet.
 */
contract ElementToken {

    string  public name;
    string  public symbol;
    uint8   public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256)                     public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "ElementToken: not owner");
        _;
    }

    /**
     * @param _name           Token name
     * @param _symbol         Token symbol
     * @param _totalSupplyWei Total supply already in wei (factory multiplies before calling)
     * @param _owner          Deployer wallet — set as owner after factory finishes distribution
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupplyWei,
        address _owner
    ) {
        require(_owner != address(0),      "ElementToken: zero owner");
        require(bytes(_name).length > 0,   "ElementToken: empty name");
        require(bytes(_symbol).length > 0, "ElementToken: empty symbol");
        require(_totalSupplyWei > 0,       "ElementToken: zero supply");

        name        = _name;
        symbol      = _symbol;
        owner       = _owner;
        totalSupply = _totalSupplyWei;

        // Mint full supply to factory (msg.sender) so it can handle distribution
        balanceOf[msg.sender] = _totalSupplyWei;
        emit Transfer(address(0), msg.sender, _totalSupplyWei);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= amount, "AchToken: insufficient allowance");
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0),          "AchToken: transfer to zero");
        require(balanceOf[from] >= amount, "AchToken: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "AchToken: mint to zero");
        totalSupply   += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "AchToken: burn exceeds balance");
        balanceOf[msg.sender] -= amount;
        totalSupply           -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "AchToken: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }
}

// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// contract SimpleERC20 {
//     string public name;
//     string public symbol;
//     uint8 public decimals;
//     uint256 public totalSupply;
//     mapping(address => uint256) public balanceOf;
//     mapping(address => mapping(address => uint256)) public allowance;

//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event Approval(address indexed owner, address indexed spender, uint256 value);

//     constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _supply) {
//         name = _name;
//         symbol = _symbol;
//         decimals = _decimals;
//         totalSupply = _supply * 10**_decimals;
//         balanceOf[msg.sender] = totalSupply;
//         emit Transfer(address(0), msg.sender, totalSupply);
//     }

//     function transfer(address to, uint256 value) public returns (bool) {
//         balanceOf[msg.sender] -= value;
//         balanceOf[to] += value;
//         emit Transfer(msg.sender, to, value);
//         return true;
//     }

//     function approve(address spender, uint256 value) public returns (bool) {
//         allowance[msg.sender][spender] = value;
//         emit Approval(msg.sender, spender, value);
//         return true;
//     }

//     function transferFrom(address from, address to, uint256 value) public returns (bool) {
//         allowance[from][msg.sender] -= value;
//         balanceOf[from] -= value;
//         balanceOf[to] += value;
//         emit Transfer(from, to, value);
//         return true;
//     }
// }