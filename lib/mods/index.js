var async = require('async')
var events = require('events')
var filesize = require('filesize')

var folderSize = require('./folderSize')
var modFile = require('./modFile')
var steamMeta = require('./steamMeta')

var ArmaSteamWorkshop = require('arma-steam-workshop')
const { result } = require('underscore')

var Mods = function (config) {
  this.config = config
  this.armaSteamWorkshop = new ArmaSteamWorkshop(this.config.steam)
  this.mods = []
}

Mods.prototype = new events.EventEmitter()

Mods.prototype.delete = function (mod, cb) {
  var self = this
  this.armaSteamWorkshop.deleteMod(mod, function (err) {
    if (err) {
      console.log(err)
    } else {
      self.updateMods()
    }

    if (cb) {
      cb(err)
    }
  })
}

Mods.prototype.find = function (id) {
  return this.mods.find(function (mod) {
    return mod.id === id
  })
}

Mods.prototype.download = function (workshopId, cb) {
  var self = this
  this.armaSteamWorkshop.downloadMod(workshopId, function (err) {
    self.updateMods()

    if (cb) {
      cb(err)
    }
  })
  self.updateMods()
}

Mods.prototype.search = function (query, cb) {
  this.armaSteamWorkshop.search(query, cb)
}

Mods.prototype.updateMods = function () {
  var self = this
  this.armaSteamWorkshop.mods(function (err, mods) {
    if (err) {
      console.log(err)
    } else {
      async.map(mods, self.resolveModData.bind(self), function (err, mods) {
        if (err) {
          console.log(err)
          return
        }

        self.mods = mods
        self.emit('mods', mods)
      })
    }
  })
}

Mods.prototype.resolveModData = function (mod, cb) {
  var self = this
  async.parallel({
    folderSize: function (cb) {
      folderSize(mod.path, self.config, cb)
    },
    modFile: function (cb) {
      modFile(mod.path, self.config, cb)
    },
    steamMeta: function (cb) {
      steamMeta(mod.path, self.config, cb)
    }
  }, function (err, results) {
    if (err) {
      return cb(err)
    }

    cb(null, {
      downloading: mod.downloading,
      id: mod.id,
      name: mod.name,
      needsUpdate: mod.needsUpdate,
      path: mod.path,
      size: results.folderSize,
      formattedSize: filesize(results.folderSize),
      modFile: results.modFile,
      steamMeta: results.steamMeta
    })
  })
}

module.exports = Mods
