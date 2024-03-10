const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express.Router();
require("../db/conn");
const User = require("../models/userSchema");
const authenticate = require("../middleware/authenticate");

const nodeGeocoder = require("node-geocoder");

const options = {
  // Provide the provider (e.g., 'openstreetmap' or 'google')
  provider: "openstreetmap",
};

// Initialize the geocoder
const geocoder = nodeGeocoder(options);

// const client = new LocationIQClient("AIzaSyB6fd3EewUHf7GniqhGylyJUTUDlRjbM-g");

app.get("/", (req, res) => {
  res.send("Hey Hi");
});

// ------------ User Registration -------------------
app.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      contactNumber,
      sportsInterests,
      skillLevel,
      preferredActivities,
      latitude,
      longitude,
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      sportsInterests,
      skillLevel,
      preferredActivities,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    // Save user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------Login page using async method------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const userLogin = await User.findOne({ email });

    if (!userLogin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, userLogin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = await userLogin.generateAuthToken();

    res.status(200).json({ token: token, message: "Login successful!" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------ location-based search -----------------
app.post("/search", authenticate, async (req, res) => {
  try {
    const { latitude, longitude, distance } = req.body;
    const userIdString = req.userID.toString(); // Convert to string

    const user = await User.findById(req.userID);
    // Extract the sportsInterests from the user object
    const sportsInterests = user.sportsInterests;

    // Validate distance parameter (direct check for NaN)
    if (isNaN(distance)) {
      return res.status(400).json({ error: "Invalid distance parameter" });
    }

    const distanceInMeters = parseFloat(distance) * 1000;

    const users = await User.find(
      {
        _id: { $ne: userIdString }, // Exclude current user (using string)
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: distanceInMeters, // Convert to meters
          },
        },
        sportsInterests: { $in: sportsInterests },
      },
      {
        location: 1,
        email: 1,
        sportsInterests: 1,
        skillLevel: 1,
        preferredActivities: 1,
        _id: 0, // Exclude the _id field
      })
    

    res.status(200).json({ message: "ok", users: users });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/currentuserlocation", authenticate, async (req, res) => {
  try {
    // Extract latitude and longitude from the request body
    const { latitude, longitude } = req.body;

    // Ensure latitude and longitude are provided
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    // Update the user's location coordinates in the database
    const user = await User.findById(req.userID);

    // Ensure that the user is found in the database
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure that the location property exists before updating coordinates
    if (!user.location) {
      user.location = { type: "Point", coordinates: [longitude, latitude] };
    } else {
      user.location.coordinates = [longitude, latitude];
    }
    await user.save();

    // Respond with the updated user object
    res.status(200).json({ message: "saved successfully!" });
  } catch (error) {
    console.error("Error during updating current user location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = app;
