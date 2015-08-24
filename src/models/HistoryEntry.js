const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const HistoryEntry = mongoose.model('HistoryEntry', {
  _id: String
, media: { type: ObjectId, ref: 'Media' }
, dj: { type: Number, ref: 'User' }
, time: { type: Date, default: Date.now }
, score:
  { positive: Number
  , negative: Number
  , grabs: Number
  , listeners: Number
  , skipped: Number }
, skip:
  { kind: String
  , reason: String
  , time: Date
  , user: { type: Number, ref: 'User' } }
})

export default HistoryEntry