const provider = new ethers.providers.Web3Provider(window.ethereum);

const ABI = [
  "event createAccountEvent(address[] owners, uint256 indexed id, uint256 timestamp)",
  "event requestWithdrawEvent(address indexed owner, uint256 indexed accountId, uint256 indexed withdrawId, uint256 amount, uint256 timestamp)",
  "event withdrawAmountEvent(uint256 indexed withdrawId, uint256 timestamp)",
  "function accounts(uint256) view returns (uint256 balance)",
  "function approveWithdraw(uint256 withdrawAccountId, uint256 withdrawId)",
  "function createAccount(address[] otherOwner)",
  "function deposite(uint256 depositeAccountId) payable",
  "function getApproval(uint256 accountId, uint256 withdrawId) view returns (bool)",
  "function getBalance(uint256 accountId) view returns (uint256)",
  "function getNoOfApproval(uint256 accountId, uint256 withdrawId) view returns (uint256)",
  "function getOwner(uint256 accountId) view returns (address[])",
  "function getUserAccounts() view returns (uint256[])",
  "function requestWithdraw(uint256 withdrawAccountId, uint256 amount)",
  "function userAccounts(address, uint256) view returns (uint256)",
  "function withdrawAmount(uint256 withdrawId, uint256 accountId)",
];

const address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; //conteract address

let contract = null;

// used to connect to the contract
async function getAccess() {
  if (contract) return contract;
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  contract = new ethers.Contract(address, ABI, signer);
}

async function createAccount() {
  await getAccess();
  const otherOwner = document.getElementById("createAccount").value.split(",");
  const tx = await contract.createAccount(otherOwner);
  await tx.wait();
  console.log("Account created");
}

async function showAccounts() {
  await getAccess();
  const accounts = await contract.getUserAccounts();
  console.log(accounts);
  document.getElementById("showAccounts").innerHTML =
    accounts.length === 0 ? "No accounts" : accounts;
}

async function getBalance() {
  await getAccess();
  const accountId = document.getElementById("getBalance").value;
  const balance = await contract.getBalance(accountId);
  console.log(balance);
  document.getElementById("showBalance").innerHTML = `: ${balance}`;
}

async function handleWithdrawRequest() {
  await getAccess();
  const withdrawAccountId = document.getElementById("getAccountId").value;
  const amount = document.getElementById("getAmount").value;
  const tx = await contract.requestWithdraw(withdrawAccountId, amount);
  await tx.wait();
  console.log("Withdraw request sent");
}
