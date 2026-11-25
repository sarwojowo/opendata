// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RemotePayment.sol";

contract EscrowFactory {

    address[] public allEscrows;

    mapping(address => address[]) public escrowsByClient;
    mapping(address => address[]) public escrowsByArtist;

    event EscrowCreated(
        address escrow,
        address client,
        address artist,
        address arbiter
    );

    function createEscrow(
        address _artist,
        address _arbiter
    ) external returns (address) {

        require(_artist != address(0), "Invalid artist");
        require(_arbiter != address(0), "Invalid arbiter");
        require(_artist != msg.sender, "Client cannot be artist");

        RemotePayment escrow = new RemotePayment(
            msg.sender,   // client otomatis pembuat
            _artist,
            _arbiter
        );

        address escrowAddress = address(escrow);

        allEscrows.push(escrowAddress);
        escrowsByClient[msg.sender].push(escrowAddress);
        escrowsByArtist[_artist].push(escrowAddress);

        emit EscrowCreated(
            escrowAddress,
            msg.sender,
            _artist,
            _arbiter
        );

        return escrowAddress;
    }

    function getAllEscrows() external view returns (address[] memory) {
        return allEscrows;
    }

    function getClientEscrows(address _client)
        external
        view
        returns (address[] memory)
    {
        return escrowsByClient[_client];
    }

    function getArtistEscrows(address _artist)
        external
        view
        returns (address[] memory)
    {
        return escrowsByArtist[_artist];
    }
}