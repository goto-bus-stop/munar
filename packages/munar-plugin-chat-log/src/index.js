import { Plugin, command } from 'munar-core'

import escapeStringRegExp from 'escape-string-regexp'
import moment from 'moment'

export default class ChatLog extends Plugin {
  static description = 'Logs chat messages.'

  constructor (bot, options) {
    super(bot, options)

    this.onChat = this.onChat.bind(this)
  }

  init () {
    this.bot.on('message', this.onChat)
  }

  destroy () {
    this.bot.removeListener('message', this.onChat)
  }

  @command('lastspoke')
  async showLastSpoke (message, ...nameParts) {
    const ChatMessage = this.bot.model('ChatMessage')
    const User = this.bot.model('User')

    const adapter = message.source.getAdapterName()
    const targetName = nameParts.join(' ')
    try {
      const target = await User.findOne({
        adapter,
        username: RegExp(`^${escapeStringRegExp(targetName)}$`, 'i')
      })
      if (!target) {
        message.reply('Could not find a user by that name.')
        return
      }
      const [msg] = await ChatMessage.find({ user: target })
        .sort({ createdAt: -1 })
        .select('createdAt')
        .limit(1)
      const time = moment(msg.createdAt)
      message.reply(
        `${target.username} last uttered a word on ` +
        `${time.format('LL [at] LT')} (${time.fromNow()}).`
      )
    } catch (e) {
      message.reply(`I haven't seen ${targetName} speak.`)
    }
  }

  async onChat (message) {
    const User = this.bot.model('User')
    const ChatMessage = this.bot.model('ChatMessage')

    try {
      const user = await User.from(message.user)
      const adapter = message.source.getAdapterName()
      await ChatMessage.create({
        adapter,
        sourceId: message.id,
        type: message.type || 'chat',
        user: user ? user.id : null,
        message: message.text
      })
    } catch (err) {
      console.error(err.stack)
    }
  }
}
