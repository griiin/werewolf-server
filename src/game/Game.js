var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
Player = require('./Player.js'),
roles = require('../roles/roles');

var Game = function (id, creator, roles, language) {
  log.info ("[gme] " + creator.username + " create game n" + id);
  this.id = id;
  this.players = [];
  this.players.push(new Player(creator));
  this.roles = roles;
  this.language = language;
  this.started = false;
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

Game.prototype.removeClientBySocket = function (socket) {
  if (!this.started) {
    _.remove(this.players, function (player) {
      return player.getClient().socket === socket;
    });
  } else {
    _(this.players).where(function (player) {
      return player.getClient().socket === socket;
    }).forEach(function (player) {
      player.role.Die();
    });
  }
};

Game.prototype.isEmpty = function () {
  if (!this.started) {
    return this.players.length === 0;
  }
  var alivePlayers = _.where(this.players, function (player) {
    return player.role.getIsAlive();
  });
  return !alivePlayers || alivePlayers.length === 0;
};

Game.prototype.broadcast = function (cmd, data) {
  _.forEach(this.players, function (player) {
    player.emit(cmd, data);
  });
};

Game.prototype.tryRemoveUser = function (clientToRemove) {
  if (this.contains(clientToRemove)) {
    if (!this.started) {
      _.remove(this.players, function (player) {
        return player.getClient() === clientToRemove;
      });
    } else {
      _(this.players).where(function (player) {
        return player.getClient() === clientToRemove;
      }).forEach(_.bind(function (player) {
        player.role.Die();
      }, this));
    }
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
    if (!this.started) {
      return player.getClient() === client;
    } else {
      return player.getClient() === client && player.role.launch();
    }
  });
};
/*
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

Game.delayFactor = 1000;

Game.prototype.start = function () {
  log.info('[gme] launching game id' + this.id);
  this.started = true;
  Q.fcall(_.bind(this.definesRoles, this))
  .delay(10 * Game.delayFactor)
  .then(_.bind(this.launchCityHallLite, this))
  .delay(60 * Game.delayFactor)
  .then(_.bind(this.stopCityHall, this))
  .then(_.bind(function () {
    while (!this.hasReachedConclusion()) {
      //
    }
    this.launchGameSummary();
  }, this))
  .done();


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
  // // this.launchGameSummary();
};

Game.prototype.launchCityHallLite = function () {
  return this.launchCityHall(true);
};

Game.prototype.launchCityHall = function (isLite) {
  this.broadcast("cityhall_start");
  this.startListenning();
};

Game.prototype.stopCityHall = function (isLite) {
  this.broadcast("cityhall_stop");
  this.stopListenning();
};

Game.prototype.stopListenning = function () {
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.removeAllListeners("msg");
  }, this));
};

Game.prototype.startListenning = function () {
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.on("msg", _.bind(function (msg) {
      this.broadcast("msg", { player: player.getClient().username , msg: msg});
    }, this));
  }, this));
};

Game.prototype.launchGameSummary = function () {
  var victoriousTeam = this.getVictoriousTeam();
  _.forEach(this.players, function (player) {
    var msg = player.role.team === victoriousTeam ? 'You\'ve won' : 'You\'ve loose';
    player.emit("end_game", msg);
  });
};

Game.prototype.hasReachedConclusion = function () {
  return this.getVictoriousTeam() !== null;
};

Game.prototype.getVictoriousTeam = function () {
  var aliveCitizens = _.where(this.players, function (player) {
    return player.role.isAlive && player.role.team === 'town';
  });
  var aliveWerewolves = _.where(this.players, function (player) {
    return player.role.isAlive && player.role.team === 'werewolf';
  });

  if (aliveCitizens.length > 0 && aliveWerewolves.length > 0) {
    return null;
  } else {
    return aliveCitizens.length > 0 ? 'town' : 'werewolf';
  }
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

function delay(s) {
  var deferred = Q.defer();
  setTimeout(deferred.resolve, s * 1);
  return deferred.promise;
}

module.exports = Game;
