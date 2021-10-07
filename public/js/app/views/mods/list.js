var $ = require('jquery')
var _ = require('underscore')
var Marionette = require('marionette')

var ListItemView = require('app/views/mods/list_item')
var tpl = require('tpl/mods/list.html')

var template = _.template(tpl)

module.exports = Marionette.CompositeView.extend({
  childView: ListItemView,
  childViewContainer: 'tbody',
  template: template,
  templateHelpers: function () {
    return {
      filterValue: this.filterValue
    }
  },

  events: {
    'click #refresh': 'refresh',
    'keyup #filterMods': 'updateFilter'
  },

  initialize: function () {
    this.filterValue = ''
  },

  filter: function (child, index, collection) {
    return child.get('name').toLowerCase().indexOf(this.filterValue.toLowerCase()) >= 0
  },

  updateFilter: function (event) {
    this.filterValue = event.target.value
    this.render()
  },

  refresh: function (event) {
    event.preventDefault()
    $.ajax({
      url: '/api/mods/refresh',
      type: 'POST',
      success: function (resp) {

      },
      error: function (resp) {

      }
    })
  }
})
