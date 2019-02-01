const StarNotary = artifacts.require('StarNotary');

var accounts;
var owner;
let countIds = 1;

contract('StarNotary', (accs) => {
	accounts = accs;
	owner = accounts[0];
});

it('can Create a Star', async () => {
	let tokenId = countIds;
	let instance = await StarNotary.deployed();
	await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] });

	countIds++;
	assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let starId = countIds;
	let starPrice = web3.utils.toWei('.01', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });

	countIds++;
	assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = countIds;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
	await instance.buyStar(starId, { from: user2, value: balance });
	let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
	let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
	let value2 = Number(balanceOfUser1AfterTransaction);

	countIds++;
	assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = countIds;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	await instance.buyStar(starId, { from: user2, value: balance });

	countIds++;
	assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
	let instance = await StarNotary.deployed();
	let user1 = accounts[1];
	let user2 = accounts[2];
	let starId = countIds;
	let starPrice = web3.utils.toWei('.01', 'ether');
	let balance = web3.utils.toWei('.05', 'ether');
	await instance.createStar('awesome star', starId, { from: user1 });
	await instance.putStarUpForSale(starId, starPrice, { from: user1 });
	let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
	const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
	await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
	const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
	let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);

	countIds++;
	assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
	// 1. create a Star with different tokenId. Why create a star is needed to this test?
	const instance = await StarNotary.deployed();
	const name = 'Star Notary';
	const symbol = 'STAR';
	//2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
	assert.equal(await instance.name.call(), name);
	assert.equal(await instance.symbol.call(), symbol);
});

it('lets 2 users exchange stars', async () => {
	// 1. create 2 Stars with different tokenId
	const instance = await StarNotary.deployed();
	const id1 = countIds;
	countIds++;
	const id2 = countIds;
	countIds++;
	const name1 = 'Star1';
	const name2 = 'Star2';
	const user1 = accounts[0];
	const user2 = accounts[1];
	await instance.createStar(name1, id1, { from: user1 });
	await instance.createStar(name2, id2, { from: user2 });
	// 2. Call the exchangeStars functions implemented in the Smart Contract
	await instance.exchangeStars(id1, id2);
	// 3. Verify that the owners changed
	assert.equal(await instance.ownerOf.call(id1), user2);
	assert.equal(await instance.ownerOf.call(id2), user1);
});

it('lets a user transfer a star', async () => {
	// 1. create a Star with different tokenId
	const instance = await StarNotary.deployed();
	const id = countIds;
	const name = 'Star to transfer';
	const sender = accounts[0];
	const to = accounts[1];
	countIds++;

	await instance.createStar(name, id, { from: sender });

	// 2. use the transferStar function implemented in the Smart Contract
	await instance.transferStar(to, id);

	// 3. Verify the star owner changed.
	assert.equal(await instance.ownerOf.call(id), to);
});

it('lookUptokenIdToStarInfo test', async () => {
	let instance = await StarNotary.deployed();
	let tokenId = countIds;
	countIds++;

	const starName = 'My new star';

	// 1. create a Star with different tokenId
	await instance.createStar(starName, tokenId, { from: accounts[0] });

	// 2. Call your method lookUptokenIdToStarInfo
	// 3. Verify if you Star name is the same
	assert.equal(await instance.lookUptokenIdToStarInfo.call(tokenId), starName);
});