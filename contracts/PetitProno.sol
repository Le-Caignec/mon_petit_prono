// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9; 
import "hardhat/console.sol";

contract PetitProno {

    address public owner;

    event NewLeague(string _LeagueId, string _League_name);
    event NewTeam(string _LeagueId, string _TeamId, string _Team_name);
    event NewForecast(string _LeagueId, string _ForecastId);
    enum Time{ AVAILABLE, FINISHED }
    enum NFT_Mint{ DISABLED, ENABLED, MINTED }

    struct Forecast{
        string [2] teams;
        uint[2] prono;
        uint[2] result;
        uint PointNb;
        uint matchDate;
        bool scoreIsSet;
        NFT_Mint nftMint;
        Time time;
    }

    struct Player {
        string Player_name;
        uint score;
        string [] keyMappingForecasts;
        NFT_Mint [3] nftTeam ;
        NFT_Mint nftPlayer;
        mapping(string => Forecast) Forecasts;
    }

    struct Team {
        string Team_name;
        string ipfs;
        address [] keyMappingPlayer;
        address [] bestPlayers;
        uint totalScore;
        mapping(address => Player) Players;
    }

    struct League {
        string refTeamId;
        string League_name;
        string ipfs;
        string [] keyMappingTeam;
        Time time;  
        string [] bestTeams;
        mapping(string => Team) Teams;
    }
    
    string [] keyMappingLeague;
    mapping(string => League) Leagues;

    constructor(){
        owner = msg.sender;
    }

    modifier OnlyOwner{
        require(msg.sender == owner);
        _;
    }

    modifier ValideEnd(uint _endDate){
        require(block.timestamp < _endDate, "End date must be in the future");
        _;
    }

    //change the owner of the contract
    function changeOwner(address _newOwner) public OnlyOwner{
        owner = _newOwner;
    }



    /** LEAGUE */
    //add a league
    function addLeague(string memory _LeagueId, string memory _League_name,string memory _ipfs) public OnlyOwner{
        Leagues[_LeagueId].League_name = _League_name;
        Leagues[_LeagueId].ipfs = _ipfs;
        Leagues[_LeagueId].time = Time.AVAILABLE;
        keyMappingLeague.push(_LeagueId);
        emit NewLeague(_LeagueId, _League_name);
    }  

    // get all leagues id
    function getLeaguesID() public view returns(string[] memory){
        return keyMappingLeague;
    }

    //get all info of a League
    function getLeagueById(string memory _LeagueId) public view returns(string [3] memory){
        string memory League_name = Leagues[_LeagueId].League_name;
        string memory ipfs = Leagues[_LeagueId].ipfs;
        return [_LeagueId, League_name, ipfs];
    } 

    //time up for the league
    function endLeague(string memory _LeagueId) public OnlyOwner{
        Leagues[_LeagueId].time = Time.FINISHED;
    }

    //get the time of a league
    function getTime(string memory _LeagueId) public view returns(Time){
        return Leagues[_LeagueId].time;
    }

    //get the best players of a league
    function getBestTeams(string memory _LeagueId) public view returns(string [] memory){
        return Leagues[_LeagueId].bestTeams;
    }

    //sort the best teams of a league
    function SortBestTeams(string memory _LeagueId) public {
        calculateScore(_LeagueId);
        uint _TeamNb = Leagues[_LeagueId].keyMappingTeam.length;
        string [] memory _teams = new string[](_TeamNb);
        for ( uint i; i<_TeamNb;i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            _teams[i] = _TeamId;
        }
        for (uint j; j<_TeamNb;j++){
            for (uint l; l<_TeamNb;l++){
                if (Leagues[_LeagueId].Teams[_teams[j]].totalScore > Leagues[_LeagueId].Teams[_teams[l]].totalScore){
                    string memory _temp = _teams[j];
                    _teams[j] = _teams[l];
                    _teams[l] = _temp;
                }
            }
        }
        string [] memory _bestTreeTeams = new string[](3);
        uint k = 0;
        while (k<3 && k<_TeamNb) {
            _bestTreeTeams[k] = _teams[k];
            for (uint j; j<Leagues[_LeagueId].Teams[_teams[k]].keyMappingPlayer.length;j++){
                address _player = Leagues[_LeagueId].Teams[_teams[k]].keyMappingPlayer[j];
                Leagues[_LeagueId].Teams[_teams[k]].Players[_player].nftTeam[k] = NFT_Mint.ENABLED;
            }
            k++;
        }
        Leagues[_LeagueId].bestTeams = _bestTreeTeams;
    }

    

    /** TEAM */
    //add a team
    function addTeam(string memory _LeagueId,string memory _TeamId, string memory _Teame_Name, string memory _Player_name, string memory _ipfs) public{
        Leagues[_LeagueId].Teams[_TeamId].Team_name = _Teame_Name;
        Leagues[_LeagueId].Teams[_TeamId].ipfs = _ipfs;
        Leagues[_LeagueId].keyMappingTeam.push(_TeamId);
        addPlayer(_LeagueId, _TeamId,  _Player_name);
        emit NewTeam(_LeagueId, _TeamId, _Teame_Name);
    }

    // return all the team of a league in which the player is
    function getMyTeamFromOneLeague(string memory _LeagueId) public view returns(string [] memory){
        uint _TeamNb = Leagues[_LeagueId].keyMappingTeam.length;
        string [] memory _myTeam = new string[](_TeamNb);
        uint rg = 0;
        for (uint k; k<_TeamNb;k++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[k];
            for (uint i; i<Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length;i++){
                if (Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[i] == msg.sender){
                    _myTeam[rg]=_TeamId;
                    rg+=1;
                }
            }
        }
        string [] memory _result = new string[](rg);
        for (uint j; j<rg;j++){
            _result[j]=_myTeam[j];
        }
        return _result;
    }

    //return all the theam of a league in which the player is not
    function getFreeTeamFromOneLeague(string memory _LeagueId) public view returns(string [] memory){
        string [] memory _myTeam = getMyTeamFromOneLeague(_LeagueId);
        string [] memory _freeTeam = new string[](Leagues[_LeagueId].keyMappingTeam.length - _myTeam.length);
        uint rg = 0;
        for(uint i; i<Leagues[_LeagueId].keyMappingTeam.length; i++){
            bool test = false;
            for (uint k; k<_myTeam.length ; k++){
                if (keccak256(abi.encodePacked(_myTeam[k])) == keccak256(abi.encodePacked(Leagues[_LeagueId].keyMappingTeam[i]))){
                    test = true;
                }
            }
            if (test == false){
                _freeTeam[rg]=Leagues[_LeagueId].keyMappingTeam[i];
                rg+=1;
            }
        }
        return _freeTeam;
    }

    //get all Team Id of an League
    function getTeamsIdFromOneLeague(string memory _LeagueId) public view returns(string [] memory){
        return Leagues[_LeagueId].keyMappingTeam;
    }

    //return infos of a team for and Id
    function getTeamsInfos(string memory _LeagueId, string memory _TeamId) public view returns(string [3] memory){
        string memory Team_name = Leagues[_LeagueId].Teams[_TeamId].Team_name;
        string memory ipfs = Leagues[_LeagueId].Teams[_TeamId].ipfs;
        return [_TeamId,Team_name,ipfs];
    }                       

    //sort best player of a team
    function SortBestPlayers(string memory _LeagueId) public {
        for ( uint i; i<Leagues[_LeagueId].keyMappingTeam.length;i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            uint _PlayerNb = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length;
            address [] memory _players = new address[](_PlayerNb);
            for (uint k; k<_PlayerNb;k++){
                _players[k]=Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[k];
            }
            for (uint j; j<_PlayerNb;j++){
                for (uint l; l<_PlayerNb;l++){
                    if (Leagues[_LeagueId].Teams[_TeamId].Players[_players[j]].score > Leagues[_LeagueId].Teams[_TeamId].Players[_players[l]].score){
                        address _temp = _players[j];
                        _players[j] = _players[l];
                        _players[l] = _temp;
                    }
                }
            }
            address [] memory _bestTreePlayers = new address[](3);
            uint m = 0;
            while (m<3 && m<_PlayerNb) {
                _bestTreePlayers[m] = _players[m];
                Leagues[_LeagueId].Teams[_TeamId].Players[_players[m]].nftPlayer = NFT_Mint.ENABLED;
                m++;
            }
            Leagues[_LeagueId].Teams[_TeamId].bestPlayers = _bestTreePlayers;
        }
    }

    //get the best player of a team
    function getBestPlayers(string memory _LeagueId, string memory _TeamId) public view returns(address [] memory){
        return Leagues[_LeagueId].Teams[_TeamId].bestPlayers;
    }

    //calculate the score of each team
    function calculateScore(string memory _LeagueId) public {
        for (uint i; i<Leagues[_LeagueId].keyMappingTeam.length;i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            uint _PlayerNb = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length;
            uint _score = 0;
            for (uint k; k<_PlayerNb;k++){
                address _player = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[k];
                _score += Leagues[_LeagueId].Teams[_TeamId].Players[_player].score;
            }
            Leagues[_LeagueId].Teams[_TeamId].totalScore = _score;
        }
    }



    /** PLAYER */
    //add a player to a certain league and team
    function addPlayer(string memory _LeagueId, string memory _TeamId, string memory _Player_name) public {
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Player_name = _Player_name;
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftTeam[0] = NFT_Mint.DISABLED;
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftTeam[1] = NFT_Mint.DISABLED;
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftTeam[2] = NFT_Mint.DISABLED;
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftPlayer = NFT_Mint.DISABLED;
        Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.push(msg.sender);
        if (keccak256(abi.encodePacked(Leagues[_LeagueId].refTeamId)) != ""){
            string memory _referenceTeamId = Leagues[_LeagueId].refTeamId;
            for (uint k; k<Leagues[_LeagueId].Teams[_referenceTeamId].Players[owner].keyMappingForecasts.length; k++){
                string memory _forecastId = Leagues[_LeagueId].Teams[_referenceTeamId].Players[owner].keyMappingForecasts[k];
                Forecast memory _forecast = Leagues[_LeagueId].Teams[_referenceTeamId].Players[owner].Forecasts[_forecastId];         
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].keyMappingForecasts.push(_forecastId);
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].teams = _forecast.teams;
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].prono = [100,100];
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].result = _forecast.result;
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].PointNb = 0;
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].matchDate = _forecast.matchDate;
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].scoreIsSet = _forecast.scoreIsSet;   
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].nftMint = _forecast.nftMint;   
                Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_forecastId].time = _forecast.time;   
            }
        }
        emit NewTeam( _LeagueId,  _TeamId, Leagues[_LeagueId].Teams[_TeamId].Team_name);
    }

    //update score of all players in a certain team of a league
    function updateScore(string memory _LeagueId, string memory _TeamId) public {
        uint _PlayerNb = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length;
        for (uint i; i<_PlayerNb;i++){
            address _player = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[i];
            uint _score = 0;
            for (uint k ; k<Leagues[_LeagueId].Teams[_TeamId].Players[_player].keyMappingForecasts.length; k++){
                string memory _key = Leagues[_LeagueId].Teams[_TeamId].Players[_player].keyMappingForecasts[k];
                _score += Leagues[_LeagueId].Teams[_TeamId].Players[_player].Forecasts[_key].PointNb;
            }
            Leagues[_LeagueId].Teams[_TeamId].Players[_player].score = _score;
        }
    }

    //return all the player of a certain team and league
    function getAllPlayerAddrFromOneTeam(string memory _LeagueId, string memory _TeamId) public view returns(address [] memory){
        return Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer;
    }

    //return the name of a player and his score of a certain team and league
    function getPlayerInfo(string memory _LeagueId, string memory _TeamId, address _walletId) public view returns(string memory,uint, NFT_Mint [3] memory, NFT_Mint){
        string memory Player_name = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Player_name;
        uint score = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].score;
        NFT_Mint [3] memory nftTeam = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].nftTeam;
        NFT_Mint nftPlayer = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].nftPlayer;
        return (Player_name, score, nftTeam, nftPlayer);
    }
    //Player Mint his NFT for nftTeam First, second, third depending on rg
    function MintNFTTeam(string memory _LeagueId, string memory _TeamId, uint rg) public {
        require(Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftTeam[rg] == NFT_Mint.ENABLED, "NFT already mint");
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftTeam[rg] = NFT_Mint.MINTED;
    }

    //Player Mint his NFT for nftPlayer
    function MintNFTPlayer(string memory _LeagueId, string memory _TeamId) public {
        require(Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftPlayer == NFT_Mint.ENABLED, "NFT already mint");
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].nftPlayer = NFT_Mint.MINTED;
    }

    /** FORECAST */
    //add a forecast from a player
    function addForecast(string memory _LeagueId,  string memory _matchId, string [2] memory  teams,uint _endDate) public OnlyOwner ValideEnd(_endDate){
        for (uint i; i<Leagues[_LeagueId].keyMappingTeam.length; i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            for (uint k; k<Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length; k++){
                address _walletId = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[k];
                if(_walletId == owner && msg.sender == owner){
                    Leagues[_LeagueId].refTeamId = _TeamId;
                }
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].keyMappingForecasts.push(_matchId);
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].teams = teams;
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].prono = [100,100];
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].PointNb = 0;
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].matchDate = _endDate;
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].scoreIsSet = false;
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].nftMint = NFT_Mint.DISABLED;
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].time = Time.AVAILABLE;
                
            }
        }
        emit NewForecast(_LeagueId, _matchId );
    }

    //get forecast id of a player
    function getForecastId(string memory _LeagueId, string memory _TeamId) public view returns(string [] memory){
        return Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].keyMappingForecasts;
    }

    //get forecast info from a player
    function getForecast(string memory _LeagueId, string memory _TeamId, string memory _matchId) public view returns(string [2] memory, uint[2] memory, uint[2] memory, uint,uint,Time,bool){
        Forecast memory _match = Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId];
        return (_match.teams, _match.prono, _match.result, _match.PointNb, _match.matchDate, _match.time, _match.scoreIsSet);
    }

    //update Time of Match for all leagues
    function updateTime(string memory _LeagueId, string memory _matchId) public {
        for (uint i; i<Leagues[_LeagueId].keyMappingTeam.length; i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            for (uint k; k<Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length; k++){
                address _walletId = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[k];
                if(block.timestamp < Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].matchDate){
                    Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].time = Time.AVAILABLE;
                }else{
                    Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].time = Time.FINISHED;
                }
            }
        }
    }

    //update forecat result from a player
    function setForecastResult(string memory _LeagueId, string memory _matchId, uint[2] memory _result) public {
        updateTime( _LeagueId, _matchId);
        for (uint i; i<Leagues[_LeagueId].keyMappingTeam.length; i++){
            string memory _TeamId = Leagues[_LeagueId].keyMappingTeam[i];
            for (uint k; k<Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer.length; k++){
                address _walletId = Leagues[_LeagueId].Teams[_TeamId].keyMappingPlayer[k];
                if(block.timestamp > Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].matchDate){
                    Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].result = _result;
                    calculatePoint(_LeagueId, _TeamId, _walletId, _matchId);
                    Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].scoreIsSet = true;
                }
            }
        }
    }

    //calculate point for a player
    function calculatePoint(string memory _LeagueId, string memory _TeamId, address _walletId,string memory _matchId) public {
        uint[2] memory _result = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].result;
        uint[2] memory _prono = Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].prono;
        uint _PointNb = 0;
        if (_prono[0]!=100 && _prono[1]!=100){
            if(_result[0] == _prono[0] && _result[1] == _prono[1]){
                Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].nftMint = NFT_Mint.ENABLED;
                _PointNb = 3;
            }else if(_result[0] > _result[1] && _prono[0] > _prono[1]){
                _PointNb = 1;
            }else if(_result[0] < _result[1] && _prono[0] < _prono[1]){
                _PointNb = 1;
            }else if(_result[0] == _result[1] && _prono[0] == _prono[1]){
                _PointNb = 1;
            }
            setForecastPointNb(_LeagueId, _TeamId, _walletId,_matchId, _PointNb);
        }
    }

    //update forecat prono for a player
    function setForecastProno(string memory _LeagueId, string memory _TeamId, string memory _matchId, uint[2] memory _prono) public {
        if (block.timestamp < Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].matchDate){
            Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].prono = _prono;
        }else{
            updateTime( _LeagueId, _matchId);
        }
    }

    //update forecast point for a player
    function setForecastPointNb(string memory _LeagueId, string memory _TeamId, address _walletId,string memory _matchId, uint _PointNb) public {
        Leagues[_LeagueId].Teams[_TeamId].Players[_walletId].Forecasts[_matchId].PointNb = _PointNb;    
    }

    //get forecast point for a player
    function getForecastPointNb(string memory _LeagueId, string memory _TeamId, string memory _matchId) public view returns(uint){
        return Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].PointNb;
    }

    //set NFT mint for a player
    function setNFTMint(string memory _LeagueId, string memory _TeamId, string memory _matchId) public {
        require(Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].nftMint == NFT_Mint.ENABLED, "NFT mint is not enabled");
        Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].nftMint = NFT_Mint.MINTED;
    }

    //get NFT mint for a player
    function getNFTMint(string memory _LeagueId, string memory _TeamId, string memory _matchId) public view returns(NFT_Mint){
        return Leagues[_LeagueId].Teams[_TeamId].Players[msg.sender].Forecasts[_matchId].nftMint;
    }
}