// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract BankAccount {
    //events 

    event createAccountEvent(address[] owners, uint indexed id, uint timestamp);


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
        mapping(uint => Withdraw) withdraws;
    }


    mapping(uint => Account) public accounts;
    mapping(address => uint[]) public userAccounts;


    uint nextAccountId;
    uint nextWithdrawId;    


    //modifiers===============================================

    modifier validateOwner(address[] memory owners) {
        require(owners.length > 0, "you need to pass at least one owner");
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


    
    //createAccount function
    function createAccount(address[] calldata otherOwner) external validateOwner(otherOwner) {

        //creating the array of address according to the user input
        address[] memory owners = new address[](otherOwner.length + 1);
        //pushing the msg.sender to the array ar last position
        owners[otherOwner.length] = msg.sender;
        

        uint id = nextAccountId;

        for (uint i = 0; i < otherOwner.length; i++) {

            if( i < otherOwner.length - 1 ) {
                //copy the address
                owners[i] = otherOwner[i];
            }

            //check if the address has already moret than 3 accounts
            if(userAccounts[otherOwner[i]].length  > 3 ) {
                revert("this owner has too many accounts");
            }

            //pushing the account id to the userAccounts mapping to find how many accounts the user has
            userAccounts[otherOwner[i]].push(id);
        }

        //creating the account
        accounts[id].owner = owners;

        //increasing the nextAccountId
        nextAccountId++;

        //emiting the event
        emit createAccountEvent(owners, id, block.timestamp);
    }

    //deposit function
    //request whitdraw function
    //approve withdraw function
    //withdraw function

    //getBalance function
    //getOwner function
    //getApproval function
    //getAccounts function

}