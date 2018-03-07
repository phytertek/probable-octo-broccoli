const { ObjectId } = require('enmapi/database/utils').Types;

module.exports = {
  User: {
    Schema: {
      isFundraiser: {
        type: Boolean,
        default: false
      },
      fundraiserAcct: {
        type: Object
      },
      fundraisers: [
        {
          type: ObjectId,
          ref: 'Fundraiser'
        }
      ]
    }
  },
  Fundraiser: {
    Schema: {
      owner: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      title: {
        type: String,
        required: true,
        unique: true
      },
      description: {
        type: String
      },
      goal: {
        type: Number,
        required: true
      },
      donations: [
        {
          type: ObjectId,
          ref: 'Donation'
        }
      ]
    }
  }
};
