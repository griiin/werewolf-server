var _ = require('lodash'),
Q = require("Q"),
log = require('../misc/log.js')(),
Player = require('./Player.js'),
RoleFactory = require('../roles/roles.js');

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

Game.prototype.containsClient = function (client) {
  return _(this.players).any(function (player) {
    return player.client.username == client.username;
  });
};

Game.prototype.tryAddUser = function (user) {
  if (this.players.length >= this.maxUser() || this.containsClient(user)) {
    return false;
  }
  this.players.push(new Player(user));
  this.broadcast("new_player", {playerNb: this.players.length});
  if (this.players.length >= this.maxUser()) {
    this.broadcast("game_start", {
      playerNb: this.players.length,
      playerList: _(this.players).map(function (player) {
        return player.getClient().username;
      }).value()
    });
    this.start();
  }

  return true;
};

Game.prototype.removeClientBySocket = function (socket) {
  if (!this.started) {
    _.remove(this.players, function (player) {
      return player.getClient().socket === socket;
    });
    this.broadcast("player_left", {playerNb: this.players.length});
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

Game.prototype.broadcastTo = function (targets, cmd, data) {
  _.forEach(targets, function (player) {
    player.emit(cmd, data);
  });
};

Game.prototype.tryRemoveUser = function (clientToRemove) {
  if (this.contains(clientToRemove)) {
    if (!this.started) {
      _.remove(this.players, _.bind(function (player) {
        this.broadcast("player_left", {playerNb: this.players.length});
        return player.getClient() === clientToRemove;
      }, this));
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

Game.delayFactor = 1000;

Game.prototype.start = function () {
  log.info('[gme] launching game id' + this.id + " [players:]",
  _.map(this.players, function (player) {
    return player.getClient().username;
  }));
  this.started = true;
  Q.fcall(_.bind(this.definesRoles, this))
  .delay(10 * Game.delayFactor)
  .then(_.bind(this.launchCityHallLite, this))
  .then(_.bind(this.stopCityHall, this))
  .then(_.bind(this.gameLoop, this))
  .done();
};

Game.prototype.gameLoop = function () {
  if (!this.hasReachedConclusion()) {
    Q.fcall(_.bind(this.launchNight, this))
    .delay(60 * Game.delayFactor)
    .then(_.bind(this.stopNight, this))
    .delay(10 * Game.delayFactor)
    .then(_.bind(this.launchCityHall, this))
    .then(_.bind(this.stopCityHall, this))
    .then(_.bind(this.gameLoop, this))
    .done();
  } else {
    this.launchGameSummary();
    if (this.endEvent) {
      this.endEvent(this);
    }
  }
};

Game.prototype.getWerewolves = function () {
  return _.where(this.players, function (player) {
    return player.role.roleName === 'werewolf';
  });
};

Game.prototype.launchNight = function () {
  log.info("[gme] launching night");
  _(this.getWerewolves()).forEach(_.bind(function (werewolf) {
    werewolf.client.socket.on("msg", _.bind(function (msg) {
      this.broadcastTo(this.getWerewolves(), "msg", msg);
    }, this));
    werewolf.client.socket.on("vote", _.bind(function (data) {
      this.handleWerewolfVote(werewolf, data);
    }, this));
  }, this));
  this.broadcast("night_start");
};

Game.prototype.handleWerewolfVote = function (werewolf, data) {
  var isAllowed = _.any(this.players, function (player) {
    return player.client.username === data.target && player.role.roleName !== 'werewolf';
  });
  werewolf.role.killTarget = data.target;
  werewolf.client.socket.emit("vote_response", {result: isAllowed});
};

Game.prototype.findWerewolfTarget = function () {
  var targets = _(this.getWerewolves()).map(function (werewolf) {
    return { werewolf: werewolf, target: werewolf.role.killTarget };
  }).groupBy(function (werewolf) {
    return werewolf.target;
  }).map(function (target) {
    return { username: target[0].target, count: target.length };
  }).value();
  var maxTarget = _.max(targets, function (target) {
    return target.count;
  });
  var isOtherTargetWithMaxVote = _.any(targets, function (target) {
    return target.count === maxTarget.count &&
    target.username !== maxTarget.username;
  });
  if (isOtherTargetWithMaxVote) {
    return null;
  } else {
    return maxTarget.username;
  }
};

Game.prototype.killTargets = function (targets) {
  _.forEach(this.players, function (player) {
    if (_.contains(targets, player.client.username)) {
      player.role.Die();
    }
  });
};

Game.prototype.stopNight = function () {
  log.info("[gme] stopping night");
  var werewolfTarget = this.findWerewolfTarget();
  _(this.getWerewolves()).forEach(_.bind(function (werewolf) {
    werewolf.client.socket.removeAllListeners("msg");
    werewolf.client.socket.removeAllListeners("vote");
  }, this));
  var killed = [];
  if (werewolfTarget) {
    killed.push(werewolfTarget);
  }
  this.killTargets(killed);
  this.broadcast("night_stop", {killed: killed});
};

Game.prototype.launchCityHallLite = function () {
  return this.launchCityHall(true);
};

Game.prototype.launchCityHall = function (isVoteDisabled) {
  var deferred = Q.defer();

  log.info("[gme] launching city hall");
  this.broadcast("cityhall_start", {isVoteDisabled: !!isVoteDisabled});
  this.startListenningMessage();
  if (!isVoteDisabled) {
    this.startListenningVote();
    this.startListenningCancelVote();
  }

  setTimeout(_.bind(function () {
    if (this.isVoteConclusive()) {
      this.endCityHall();
      this.launchTribunal()
      .delay(30 * Game.delayFactor)
      .then(_.bind(this.stopTribunal, this))
      .then(_.bind(this.launchLynchVote, this))
      .delay(30 * Game.delayFactor)
      .then(_.bind(this.stopLynchVote, this))
      .then(_.bind(this.launchTribunalSummary, this))
      // .then(_.bind(this.launchCityHallLite, this))
      .then(function () {
        deferred.resolve();
      })
      .done();
    } else {
      deferred.resolve();
    }
  }, this), 60 * Game.delayFactor);

  return deferred.promise;
};

Game.prototype.isVoteConclusive = function () {
  var designatedPlayer = this.getAccusedPlayer();
  return !!designatedPlayer;
};

Game.prototype.getAccusedPlayer = function () {
  if (Object.keys(this.getVoteList()).length < 2) {
    return null;
  }
  return _(this.getVoteList())
  .where(function (accusedPlayer) {
    return !!accusedPlayer[0].voteTarget;
  })
  .max(function (accusedPlayer) {
    return accusedPlayer.length;
  }).value();
};

Game.prototype.launchTribunal = function () {
  var deferred = Q.defer();

  this.cleanPlayersForTribunal();
  this.broadcast("launch_tribunal", this.getAccusedPlayer());
  this.listenAccusedPlayer();
  this.listenNonAccusedPlayer();
  deferred.resolve();

  return deferred.promise;
};

Game.prototype.cleanPlayersForTribunal = function () {
  _(this.players).forEach(function (player) {
    player.role.isGuilty = null;
  });
};

Game.prototype.listenAccusedPlayer = function () {
  var accusedPlayerName = this.getAccusedPlayer()[0].voteTarget;
  _.forEach(this.players, _.bind(function (player) {
    if (player.getClient().username === accusedPlayerName) {
      player.client.socket.on("msg", _.bind(function (msg) {
        this.broadcast("msg", msg);
      }, this));
    }
  }, this));
};

Game.prototype.listenNonAccusedPlayer = function () {
  var accusedPlayerName = this.getAccusedPlayer()[0].voteTarget;
  var nonAccusedPlayers = _.where(this.players, function (player) {
    return player.getClient().username !== accusedPlayerName;
  });
  _.forEach(nonAccusedPlayers, _.bind(function (player) {
    player.client.socket.on("msg", _.bind(function (msg) {
      this.broadcastTo(nonAccusedPlayers, "msg", msg);
    }, this));
  }, this));
};

Game.prototype.stopTribunal = function () {
  var deferred = Q.defer();

  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.removeAllListeners("msg");
  }));
  deferred.resolve();

  return deferred.promise;
};

Game.prototype.launchLynchVote = function () {
  var deferred = Q.defer();

  this.broadcast("lynch_start");
  var accusedPlayerName = this.getAccusedPlayer()[0].voteTarget;
  var nonAccusedPlayers = _.where(this.players, function (player) {
    return player.getClient().username !== accusedPlayerName;
  });
  _.forEach(nonAccusedPlayers, _.bind(function (player) {
    player.client.socket.on("vote", _.bind(function (data) {
      player.role.lynchVote = data.isGuilty;
      player.client.socket.emit("vote_response", {result: true});
    }, this));
  }, this));

  deferred.resolve();

  return deferred.promise;
};

Game.prototype.AccusedPlayerIsJugedGuilty = function () {
  var accusedPlayerName = this.getAccusedPlayer()[0].voteTarget;
  var nonAccusedPlayers = _.where(this.players, function (player) {
    return player.getClient().username !== accusedPlayerName;
  });
  var guilty = _.where(nonAccusedPlayers, _.bind(function (player) {
    return player.role.lynchVote;
  }));
  var innocent = _.where(nonAccusedPlayers, _.bind(function (player) {
    return player.role.lynchVote === false;
  }));
  return guilty.length > innocent.length;
};

Game.prototype.lynchTheAccused = function () {
  var accusedPlayerName = this.getAccusedPlayer()[0].voteTarget;
  _.forEach(this.players, function (player) {
    player.role.Die();
  });
};

Game.prototype.stopLynchVote = function () {
  var deferred = Q.defer();

  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.removeAllListeners("vote");
  }));
  deferred.resolve();

  return deferred.promise;
};

Game.prototype.launchTribunalSummary = function () {
  var deferred = Q.defer();

  var isJugedGuilty = this.AccusedPlayerIsJugedGuilty();
  if (isJugedGuilty) {
    this.lynchTheAccused();
  }
  this.broadcast("tribunal_summary", { isJugedGuilty: isJugedGuilty });
  deferred.resolve();

  return deferred.promise;
};

Game.prototype.endCityHall = function () {
  this.stopListenningMessage();
  this.stopVoteListenners();
};

Game.prototype.stopCityHall = function (isLite) {
  this.endCityHall();
  log.info("[gme] stopping city hall");
  this.broadcast("cityhall_stop");
};

Game.prototype.stopVoteListenners = function () {
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.removeAllListeners("vote");
    player.getClient().socket.removeAllListeners("cancel_vote");
  }, this));
};

Game.prototype.startListenningCancelVote = function () {
  this.clearPlayerVote();
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.on("cancel_vote", _.bind(function (data) {
      player.role.clearVote();
      this.broadcast("vote_response", {
        result: true,
        voteList: this.getVoteList()
      });
    }, this));
  }, this));
};

Game.prototype.startListenningVote = function () {
  this.clearPlayerVote();
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.on("vote", _.bind(function (data) {
      var target = null;
      if (data.target) {
        target = this.getPlayer(data.target);
      }
      if (!target || target.client.username === player.client.username) {
        player.emit('vote_response', {result: false});
      } else {
        player.role.voteTarget = target.client.username;
        this.broadcast("vote_response", {
          result: true,
          voteList: this.getVoteList()
        });
      }
    }, this));
  }, this));
};

Game.prototype.getVoteList = function () {
  var toRet = _(this.players)
  .map(function (player) {
    return {username: player.client.username, voteTarget: player.role.voteTarget};
  })
  .groupBy(function (player) {
    return player.voteTarget;
  }).forEach(function (group) {
    _(group).forEach(function (player) {
      // delete player.voteTarget;
    });
  }).value();
  return toRet;
};

Game.prototype.clearPlayerVote = function () {
  _(this.players).forEach(function (player) {
    player.role.clearVote();
  });
};

Game.prototype.getPlayer = function (playerName) {
  var result = _.where(this.players, function (player) {
    return player.getClient().username === playerName;
  });
  return result.length === 1 ? result[0] : null;
};

Game.prototype.stopListenningMessage = function () {
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.removeAllListeners("msg");
  }, this));
};

Game.prototype.startListenningMessage = function () {
  _.forEach(this.players, _.bind(function (player) {
    player.getClient().socket.on("msg", _.bind(function (msg) {
      this.broadcast("msg", { player: player.getClient().username , msg: msg});
    }, this));
  }, this));
};

Game.prototype.launchGameSummary = function () {
  var victoriousTeam = this.getVictoriousTeam();
  _.forEach(this.players, function (player) {
    var victory = player.role.team === victoriousTeam;
    player.emit("end_game", { victory: victory });
  });
};

Game.prototype.setEndEvent = function (func) {
  this.endEvent = func;
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
      playersRole.push(RoleFactory.factory(role.roleName));
    }
  });
  playersRole = _.shuffle(playersRole);
  var i = 0;
  _.forEach(this.players, function (player) {
    player.role = playersRole[i++];
  });
  _.forEach(this.players, function (player) {
    player.emit("your_role", { roleName: player.role.roleName});
  });
};

function delay(s) {
  var deferred = Q.defer();
  setTimeout(deferred.resolve, s * 1);
  return deferred.promise;
}

module.exports = Game;
