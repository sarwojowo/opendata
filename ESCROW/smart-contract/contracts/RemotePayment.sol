// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RemotePayment {

    address public client;
    address public artist;
    address public arbiter;

    uint256 public amount;
    uint256 public initialAmount;

    uint256 public createdAt;
    uint256 public startDeadline;
    uint256 public workDeadline;
    uint256 public reviewDeadline;

    bool public started;

    enum Status { Pending, Submitted, Disputed, Completed, Refunded }
    Status public status;

    mapping(address => uint256) public pendingWithdrawals;

    struct Submission {
        string ipfsHash;
        uint256 timestamp;
        address artist;
    }

    Submission public submission;


    event Deposited(address indexed client, uint256 amount);
    event WorkStarted(address indexed artist, uint256 timestamp);
    event WorkSubmitted(string ipfsHash, uint256 timestamp, address indexed artist);
    event Approved();
    event Disputed();
    event Resolved(address winner, uint256 amount);
    event Withdrawn(address user, uint256 amount);
    event Refunded(address to, uint256 amount);
    event OrderRejected(address indexed by, string reason);


    constructor(
        address _client,
        address _artist,
        address _arbiter
    ) {
        require(_client != address(0), "Invalid client");
        require(_artist != address(0), "Invalid artist");
        require(_arbiter != address(0), "Invalid arbiter");

        client = _client;
        artist = _artist;
        arbiter = _arbiter;

        status = Status.Pending;

        createdAt = block.timestamp;

        // 🔥 deadlines
        startDeadline = block.timestamp + 2 days;   // anti ghosting
    }


    receive() external payable {
        revert("Use deposit()");
    }


    function deposit() external payable {
        require(msg.sender == client, "Only client");
        require(status == Status.Pending, "Invalid status");
        require(amount == 0, "Already funded");
        require(msg.value > 0, "Must send ETH");

        amount = msg.value;
        initialAmount = msg.value;

        emit Deposited(client, msg.value);
    }

    // ========================
    // ARTIST REJECT (BEFORE START)
    // ========================
    function rejectOrderByArtist(string memory reason) external {
        require(msg.sender == artist, "Only artist");
        require(status == Status.Pending, "Invalid status");
        require(!started, "Already started");
        require(amount > 0, "No funds to refund");
        require(block.timestamp < startDeadline, "Too late to reject");
        require(bytes(reason).length > 0, "Reason required");

        uint256 refundAmount = amount;

        status = Status.Refunded;

        pendingWithdrawals[client] += refundAmount;
        amount = 0;

        emit OrderRejected(msg.sender, reason);
        emit Refunded(client, refundAmount);
    }

    // startWork = commitment point, after this artist cannot cancel
    function startWork() external {
        require(msg.sender == artist, "Only artist");
        require(!started, "Already started");
        require(amount > 0, "Not funded");
        require(status == Status.Pending, "Invalid status");
        require(block.timestamp <= startDeadline, "Too late to start");

        started = true;
        
        workDeadline = block.timestamp + 7 days;

        emit WorkStarted(msg.sender, block.timestamp);
    }


    function cancelIfNoResponse() external {
        require(msg.sender == client, "Only client");
        require(status == Status.Pending, "Invalid status");
        require(amount > 0, "No funds");
        require(!started, "Already started");
        require(block.timestamp >= startDeadline, "Too early");

        uint256 refundAmount = amount;

        status = Status.Refunded;

        pendingWithdrawals[client] += refundAmount;
        amount = 0;

        emit Refunded(client, refundAmount);
    }


    function cancelIfNotDelivered() external {
        require(msg.sender == client, "Only client");
        require(status == Status.Pending, "Invalid status");
        require(started, "Not started");
        require(block.timestamp > workDeadline, "Too early");

        uint256 refundAmount = amount;

        status = Status.Refunded;

        pendingWithdrawals[client] += refundAmount;
        amount = 0;

        emit Refunded(client, refundAmount);
    }


    function submitWork(string memory _ipfsHash) external {
        require(msg.sender == artist, "Only artist");
        require(status == Status.Pending, "Already submitted");
        require(amount > 0, "Escrow not funded");
        require(started, "Work not started");
        require(block.timestamp <= workDeadline, "Work deadline passed");
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");

        submission = Submission({
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            artist: msg.sender
        });

        status = Status.Submitted;

        // 🔥 review window
        reviewDeadline = block.timestamp + 3 days;

        emit WorkSubmitted(_ipfsHash, block.timestamp, msg.sender);
    }


    function approveWork() external {
        require(msg.sender == client, "Only client");
        require(status == Status.Submitted, "Invalid status");

        uint256 payment = amount;

        status = Status.Completed;

        pendingWithdrawals[artist] += payment;
        amount = 0;

        emit Approved();
    }


    function autoRelease() external {
        require(status == Status.Submitted, "Invalid status");
        require(block.timestamp >= reviewDeadline, "Too early");

        uint256 payment = amount;

        status = Status.Completed;

        pendingWithdrawals[artist] += payment;
        amount = 0;

        emit Approved();
    }


    function raiseDispute() external {
        require(msg.sender == client, "Only client");
        require(status == Status.Submitted, "Invalid status");

        status = Status.Disputed;

        emit Disputed();
    }

    function resolveDispute(bool releaseToArtist) external {
        require(msg.sender == arbiter, "Only arbiter");
        require(status == Status.Disputed, "Invalid status");
        require(amount > 0, "Already resolved");

        uint256 payment = amount;

        if (releaseToArtist) {
            status = Status.Completed;
            pendingWithdrawals[artist] += payment;
            emit Resolved(artist, payment);
        } else {
            status = Status.Refunded;
            pendingWithdrawals[client] += payment;
            emit Resolved(client, payment);
        }

        amount = 0;
    }


    function withdraw() external {
        uint256 payment = pendingWithdrawals[msg.sender];
        require(payment > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: payment}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, payment);
    }


    function getSubmission()
        external
        view
        returns (string memory, uint256, address)
    {
        return (
            submission.ipfsHash,
            submission.timestamp,
            submission.artist
        );
    }
}