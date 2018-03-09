const { ObjectId } = require('enmapi/database/utils').Types;

module.exports = {
  User: {
    Schema: {
      isDonor: {
        type: Boolean,
        default: false
      },
      donorAcct: {
        type: Object
      },
      donations: [
        {
          type: ObjectId,
          ref: 'Donation'
        }
      ]
    }
  },
  Donation: {
    Schema: {
      donor: {
        type: ObjectId,
        ref: 'User',
        required: true
      },
      amount: { type: Number, required: true },
      fundraiser: {
        type: ObjectId,
        ref: 'Fundraiser'
      },
      fundraiserOwner: {
        type: ObjectId,
        ref: 'User'
      }
    }
  }
};
