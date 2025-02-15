var $ = require('jquery')
var _ = require('underscore')
var Ladda = require('ladda')
var Marionette = require('marionette')
var sweetAlert = require('sweet-alert')

var tpl = require('tpl/mods/list_item.html')

var template = _.template(tpl)

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',
  template: template,

  events: {
    'click .install': 'installMod',
    'click .destroy': 'deleteMod'
  },

  modelEvents: {
    change: 'render'
  },

  installMod: function (event) {
    var self = this
    event.preventDefault()

    this.laddaBtn = Ladda.create(this.$el.find('.ladda-button').get(0))
    this.laddaBtn.start()
    this.$el.find('.ladda-button').addClass('disabled')

    $.ajax({
      url: '/api/mods/',
      type: 'POST',
      data: {
        id: this.model.get('id')
      },
      dataType: 'json',
      success: function (resp) {
        self.laddaBtn.stop()
        self.$el.find('.ladda-button').removeClass('disabled')
      },
      error: function (resp) {
        self.laddaBtn.stop()
        self.$el.find('.ladda-button').removeClass('disabled')
      }
    })
  },

  templateHelpers: function () {
    var modFile = this.model.get('modFile')
    var steamMeta = this.model.get('steamMeta')
	var modId = this.model.get('id')

    var link = null
    var title = null

    if (steamMeta && steamMeta.id) {
      if (steamMeta.id) {
        link = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + steamMeta.id
      } else {
		link = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + modId
	  }

      if (steamMeta.name) {
        title = steamMeta.name
      }
    } else {
		link = 'https://steamcommunity.com/sharedfiles/filedetails/?id=' + modId
	}

    if (modFile && modFile.name) {
      title = modFile.name
    }

    return {
      link: link,
      title: title
    }
  },

  deleteMod: function (event) {
    var self = this
    sweetAlert({
      title: 'Are you sure?',
      text: 'The mod will be deleted from the server!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn-danger',
      confirmButtonText: 'Yes, delete it!'
    },
    function () {
      self.model.destroy()
    })
  }
})
