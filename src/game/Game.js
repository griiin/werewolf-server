var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
roles = require('../roles/roles');

var Game = function (id, creator, roles, language) {
  this.id = id;
  this.users = [];
  this.users.push(creator);
  this.roles = roles;
  this.language = language;
};

Game.prototype.getInfo = function () {
  return {
    id : this.id,
    userNb : this.users.length,
    roles: this.roles,
    language: this.language
  };
};

Game.prototype.tryAddUser = function (user) {
  if (this.users.length >= this.maxUser()) {
    return false;
  }
  this.users.push(user);
  this.broadcast("new_player", {playerNb: this.users.length});
  log.debug(this.maxUser(), this.users.length);
  if (this.users.length >= this.maxUser()) {
    this.broadcast("game_start", {playerNb: this.users.length});
    this.start();
  }

  return true;
};

Game.prototype.broadcast = function (cmd, data) {
  _.forEach(this.users, function (user) {
    user.socket.emit(cmd, data);
  });
};

Game.prototype.tryRemoveUser = function (userToRemove) {
  if (this.contains(userToRemove)) {
    _.remove(this.users, function (user) {
      return user === userToRemove;
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

Game.prototype.contains = function (user) {
  return _.contains(this.users, user);
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
  // this.definesRoles({duration: 10});
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

module.exports = Game;
