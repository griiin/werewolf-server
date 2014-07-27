var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
Player = require('./Player.js'),
roles = require('../roles/roles');

var Game = function (id, creator, roles, language) {
  this.id = id;
  this.players = [];
  this.players.push(new Player(creator));
  this.roles = roles;
  this.language = language;
};

Game.prototype.getInfo = function () {
  return {
    id : this.id,
    userNb : this.players.length,
    roles: this.roles,
    language: this.language
  };
};

Game.prototype.tryAddUser = function (user) {
  if (this.players.length >= this.maxUser()) {
    return false;
  }
  this.players.push(new Player(user));
  this.broadcast("new_player", {playerNb: this.players.length});
  if (this.players.length >= this.maxUser()) {
    this.broadcast("game_start", {playerNb: this.players.length});
    this.start();
  }

  return true;
};

Game.prototype.removeFromSocket = function (socket) {
  _.remove(this.players, function (player) {
    return player.getClient().socket === socket;
  });
};

Game.prototype.broadcast = function (cmd, data) {
  _.forEach(this.players, function (player) {
    player.emit(cmd, data);
  });
};

Game.prototype.tryRemoveUser = function (clientToRemove) {
  if (this.contains(clientToRemove)) {
    _.remove(this.players, function (player) {
      return player.getClient() === clientToRemove;
    });
    return true;
  }
  return false;
};

Game.prototype.maxUser = function () {
  var nbList = _.map(this.roles, 'nb');
  return _.reduce(nbList, function(sum, nb) {
    return sum + nb;
  });
};

Game.prototype.contains = function (client) {
  return _.where(this.players, function (player) {
    return player.getClient() === client;
  });
};
/*
it should send a broadcast when an user is connected
it should launch the game when all users are here
it should refuse user's connection if the game is full
it should send the role to the user
it should stop when every one has left

game summary
it should send a summry at the end of the game

it should start a city hall at the begin
city hall [without vote]
it should allow user sending a message
it should allow user receiving a message
it should denied user vote
it should stop allowing conversation after its duration

it should launchNight
launch night
it should allow werewolf sending a message
it should allow werewolf receiving a message
it should allow werewolf voting to kill someone
it should denied werewolf voting after its duration
it should denied non-werewolf to do werewolf actions
it should denied werewolf conversation after its duration
it should stop game if night is conclusive
it should launch night summary

it should launch launchCityHall
city hall [with vote]
it should allow user sending a message
it should allow user receiving a message
it should stop allowing conversation after its duration
it should allow user vote
it should denied actions after its duration
it should start another night if vote are unconclusive

it should start tribunal if vote are conclusive
tribunal
it should allow accused player to send message
it should allow non-accused players to send message
it should allow non-accused players to received message
it should denied accused player receiving non-accused players messages
it should denied actions after its duration

it should launch lynch vote
lynch vote
it should allow player voting
it should denied actions after its duration
it should launch tribunal summary

*/

Game.prototype.start = function () {
  this.definesRoles();


  // this.definesRoles({duration: 10})
  // // // this.launchCityHall({duration: 50, skipVote: true});
  // while (!this.hasReachedConclusion()) {
  //   // // // var nightEvents = this.launchNight({duration: 45});
  //   // // // if (this.hasReachedConclusion()) {
  //   // // //   break;
  //   // // // }
  //   // // // this.launchNightSummary({duration: 5, nightEvents: nightEvents});
  //   // // // // var voteResult = this.launchCityHall({duration: 50});
  //   // // // // // if (this.hasConclusiveVote(voteResult)) {
  //   // // // // //   this.launchTribunal({duration: 20});
  //   // // // // // //   var lynched = this.launchLynchVote({duration: 10});
  //   // // // // // //   this.launchTribunalSummary({duration: 5, lynched: lynched});
  //   // // // // // }
  // }
  // // this.launchGameSummary({duration: 15});
};

Game.prototype.definesRoles = function () {
  var playersRole = [];
  _.forEach(this.roles, function (role) {
    for (var i = 0; i < role.nb; ++i) {
      playersRole.push(roles.factory(role.roleName));
    }
  });
  playersRole = _.shuffle(playersRole);
  var i = 0;
  _.forEach(this.players, function (player) {
    player.role = playersRole[i++];
  });
  _.forEach(this.players, function (player) {
    player.emit("your_role", {roleName: player.role.roleName});
  });
};

module.exports = Game;
