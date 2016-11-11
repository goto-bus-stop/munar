/* global jest, expect, it */
import { EventEmitter } from 'events'
import ConnectTheSongs from '../'

function mockAdapter () {
  return {
    send: jest.fn()
  }
}

function mockMunar () {
  return new EventEmitter()
}

function mock (options = {}) {
  const bot = mockMunar()
  return {
    bot,
    adapter: mockAdapter(),
    cts: new ConnectTheSongs(bot, options)
  }
}

it('should keep track of the streak', () => {
  const { adapter, bot, cts } = mock()
  cts.enable()

  expect(cts.getStreak()).toBe(0)

  bot.emit('djBooth:advance', adapter, {
    previous: { author: 'Abcdef', title: 'Ghijkl' },
    next: { author: 'Qxzi', title: 'Ghijkl' }
  })

  expect(cts.getStreak()).toBe(1)

  // Test a match across the artist/title boundary
  bot.emit('djBooth:advance', adapter, {
    previous: { author: 'qxZI', title: 'GHijkl' },
    next: { author: 'ZIGH', title: 'aterloates' }
  })

  expect(cts.getStreak()).toBe(2)
  expect(adapter.send).toHaveBeenCalledTimes(2)
  expect(adapter.send).toHaveBeenCalledWith('Connected! :heavy_check_mark: The streak is now: 1')
  expect(adapter.send).toHaveBeenCalledWith('Connected! :heavy_check_mark: The streak is now: 2')

  // Test breaking the streak
  bot.emit('djBooth:advance', adapter, {
    previous: { author: 'ZIGH', title: 'aterloates' },
    next: { author: 'not a', title: 'match' }
  })

  expect(cts.getStreak()).toBe(0)
  expect(adapter.send).toHaveBeenCalledWith('The streak was broken!')
})
