const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: false,
    },

    location: {
      name: String,
      region: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },

    persona: {
      type: String,
      default: "other",
    },

    customLife: {
      type: String,
      default: "",
    },

    routine: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    activities: {
      type: [String],
      default: [],
    },

    priorities: {
      type: [String],
      default: [],
    },

    alerts: {
      type: Boolean,
      default: true,
    },

    unit: {
      type: String,
      default: "C",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);