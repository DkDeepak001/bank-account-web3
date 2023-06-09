// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BankAccount {
    //events 

    event createAccountEvent(address[] owners, uint indexed id, uint timestamp);
    event requestWithdrawEvent(address indexed owner, uint indexed accountId, uint indexed withdrawId, uint amount, uint timestamp);
    event withdrawAmountEvent(uint indexed withdrawId,uint timestamp);
    //variables

    struct Withdraw {
        address owner;
        uint amount;
        uint approvalCount;
        bool approved;
        mapping(address => bool) approvals;
    }

    struct Account {
        address[] owner;
        uint balance;
        mapping(uint => Withdraw) withdrawRequests;
    }


    mapping(uint => Account) public accounts;
    mapping(address => uint[]) public userAccounts;


    uint nextAccountId = 1 ;
    uint nextWithdrawId = 1;    


    //modifiers===============================================

    modifier validateOwner(address[] memory owners) {
        require(owners.length + 1  <= 4, "you can't have more than 4owners");

        //checking the owners address has duplicated
        for (uint i = 0; i < owners.length; i++) {
            for (uint j = i + 1; j < owners.length; j++) {
                if(owners[i] == owners[j]) {  
                    revert("you can't have duplicated owners");
                } 
            }
        }
        _;
    }

    
    modifier validateAccountOwner(uint accountId) {
        bool isOwner = false;
        for (uint i = 0; i < accounts[accountId].owner.length; i++) {
            if(accounts[accountId].owner[i] == msg.sender) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "you are not the owner of this account");
        _;
    }

    modifier toCheckBankBalance(uint accountId, uint amount) {
        require(accounts[accountId].balance >= amount, "the bank doesn't have enough balance");
        _;
    }

    modifier canApprove(uint accountsId, uint withdrawId) {
        require(!accounts[accountsId].withdrawRequests[withdrawId].approvals[msg.sender], "you have already approved this withdraw");
        require(!accounts[accountsId].withdrawRequests[withdrawId].approved, "this withdraw has already been approved");
        require(accounts[accountsId].balance >= accounts[accountsId].withdrawRequests[withdrawId].amount, "the bank doesn't have enough balance");
        require(accounts[accountsId].withdrawRequests[withdrawId].owner != msg.sender, "you can't approve your own withdraw");  
        require(accounts[accountsId].withdrawRequests[withdrawId].owner != address(0), "this withdraw doesn't exist");
        _;
    }

    modifier canWithdraw(uint accountsId, uint withdrawId) {
        require(accounts[accountsId].withdrawRequests[withdrawId].approved, "this withdraw has not been approved yet");
        require(accounts[accountsId].withdrawRequests[withdrawId].owner == msg.sender, "you are not the owner of this withdraw"); 
        _;
    }

    //functions===============================================


    
    //createAccount function
    function createAccount(address[] calldata otherOwner) external validateOwner(otherOwner)  {

        //creating the array of address according to the user input
        address[] memory owners = new address[](otherOwner.length);
        

        uint id = nextAccountId;

        for (uint i = 0; i < otherOwner.length; i++) {

            if( i <= otherOwner.length - 1 ) {
                //copy the address
                owners[i] = otherOwner[i];
            }

            //check if the address has already moret than 3 accounts
            if(userAccounts[otherOwner[i]].length  > 3 ) {
                revert("this owner has too many accounts");
            }

            //pushing the account id to the userAccounts mapping to find how many accounts the user has
            userAccounts[owners[i]].push(id);
        }

        //creating the account
        accounts[id].owner = owners;

        //increasing the nextAccountId
        nextAccountId++;

        //emiting the event
        emit createAccountEvent(owners, id, block.timestamp);
  }

    //deposit function
    function deposite( uint depositeAccountId)  external payable validateAccountOwner(depositeAccountId){
        accounts[depositeAccountId].balance += msg.value;
    }


    //request whitdraw function
    function requestWithdraw(uint withdrawAccountId, uint amount) external validateAccountOwner(withdrawAccountId) toCheckBankBalance(withdrawAccountId, amount){
        uint id = nextWithdrawId;

        Withdraw storage request = accounts[withdrawAccountId].withdrawRequests[id];

        request.owner = msg.sender;
        request.amount = amount;
        nextWithdrawId++;

        emit requestWithdrawEvent(msg.sender, withdrawAccountId, id, amount, block.timestamp);
    }



    //approve withdraw function
    function approveWithdraw(uint withdrawAccountId, uint withdrawId) external validateAccountOwner(withdrawAccountId) canApprove(withdrawAccountId, withdrawId){
        Withdraw storage request = accounts[withdrawAccountId].withdrawRequests[withdrawId];


        request.approvals[msg.sender] = true;
        request.approvalCount++;

        if(request.approvalCount == accounts[withdrawAccountId].owner.length  -1 ) {
            request.approved = true;
        }

       
    }

    //withdraw function

    function withdrawAmount(uint withdrawId,uint accountId ) external canWithdraw(accountId, withdrawId){
        uint ammount = accounts[accountId].withdrawRequests[withdrawId].amount;

        require(accounts[accountId].balance >= ammount, "the bank doesn't have enough balance");
        
        accounts[accountId].balance -= ammount;
        delete accounts[accountId].withdrawRequests[withdrawId];
         
        (bool sent,) = payable(msg.sender).call{value: ammount}("");
        require(sent, "Failed to Withraw Ether");

        emit withdrawAmountEvent(withdrawId, block.timestamp);

    }

    //getBalance function
     function getBalance(uint accountId) external view validateAccountOwner(accountId) returns(uint) {
        return accounts[accountId].balance;
    }
    //getOwner function
    function getOwner(uint accountId) external view validateAccountOwner(accountId) returns(address[] memory) {
        return accounts[accountId].owner;
    }
    //getApproval function
    function getApproval(uint accountId, uint withdrawId) external view validateAccountOwner(accountId) returns(bool) {
        return accounts[accountId].withdrawRequests[withdrawId].approved;
    }

    //get no of approval function
    function getNoOfApproval(uint accountId, uint withdrawId) external view validateAccountOwner(accountId) returns(uint) {
        return accounts[accountId].withdrawRequests[withdrawId].approvalCount;
    }
    
    //getAccounts function
    function getUserAccounts () external view returns(uint[] memory) {
        return userAccounts[msg.sender];
    }

}