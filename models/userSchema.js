const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contactNumber: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  sportsInterests: [String],
  skillLevel: String,
  preferredActivities: [String],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  tokens: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.index({ location: "2dsphere" }); // Index for location-based search

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;

// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 12);
//     // this.cpassword = await bcrypt.hash(this.cpassword, 12);
//   }
//   next();
// });
