import { Plugin, command } from 'munar-core'
import { google } from 'googleapis'
import moment from 'moment'

const debug = require('debug')('munar:events')
const gcal = google.calendar('v3')

export default class EventsCalendar extends Plugin {
  static name = 'events-calendar'
  static description = 'Google Calendar-based event scheduling.'

  static defaultOptions = {
    key: '',
    calendar: ''
  }

  @command('nextevent')
  async showNextEvent (message) {
    const body = await gcal.events.list({
      key: this.options.key,
      calendarId: this.options.calendar,
      timeMin: new Date().toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime'
    })

    if (!body.items || body.items.length === 0) {
      message.reply('No scheduled events found.')
      return
    }

    const event = body.items[0]
    const start = moment.utc(event.start.dateTime)
    if (moment().isAfter(start)) {
      message.reply(`The ${event.summary} event is going on right now!`)
      return
    }

    const hours = start.diff(moment(), 'hours')
    const calendar = start.calendar(null, {
      lastDay: '[Yesterday at] LT [GMT]',
      sameDay: '[Today at] LT [GMT]',
      nextDay: '[Tomorrow at] LT [GMT]',
      lastWeek: '[last] dddd [at] LT [GMT]',
      nextWeek: 'dddd [at] LT [GMT]',
      sameElse: 'for MMMM Do'
    })

    let text = `The next event is ${event.summary}, scheduled ${calendar}.`
    if (hours < 1) {
      text += ` (${start.fromNow(true)} from now)`
    } else if (hours < 24) {
      text += ` (${hours} hours from now)`
    }

    message.reply(text, {
      // For Slack!
      attachments: [
        {
          title: event.summary,
          titleLink: event.htmlLink,
          text: event.description
        }
      ]
    })
  }
}
