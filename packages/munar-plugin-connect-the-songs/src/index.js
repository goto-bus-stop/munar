import { Plugin, command } from 'munar-core'

function normalizeSongTitle (media) {
  return (media.author + media.title).replace(/\s+/, '').toLowerCase()
}
export default class ConnectTheSongs extends Plugin {
  static defaultOptions = {
    matchLength: 4
  }

  enable () {
    this.bot.on('djBooth:advance', this.onAdvance)

    this.streak = 0
  }

  disable () {
    this.bot.removeListener('djBooth:advance', this.onAdvance)
  }

  getStreak () {
    return this.streak
  }

  @command('streak')
  sendStreak (message) {
    message.reply(`The streak is now: ${this.streak}`)
  }

  onAdvance = (adapter, { previous, next }) => {
    if (!previous || !next) {
      return
    }

    const matchLength = this.options.matchLength
    const pTitle = normalizeSongTitle(previous)
    const nTitle = normalizeSongTitle(next)
    for (let i = 0; i < nTitle.length - matchLength; i += 1) {
      if (pTitle.includes(nTitle.slice(i, i + matchLength))) {
        this.streak++
        adapter.send(`Connected! :heavy_check_mark: The streak is now: ${this.streak}`)
        return
      }
    }
    adapter.send('The streak was broken!')
    this.streak = 0
  }
}
