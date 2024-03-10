const mongoose = require("mongoose");
const db = process.env.DATABASE;

// Set global Mongoose options (if needed)

mongoose.set('bufferCommands', false); // Disable command buffering
mongoose.set('useUnifiedTopology', true); // Enable useUnifiedTopology
mongoose.set('socketTimeoutMS', 30000); // Set socket timeout (in milliseconds)
mongoose.set('connectTimeoutMS', 30000); // Set connection timeout (in milliseconds)
mongoose.set('serverSelectionTimeoutMS', 30000); // Set server selection timeout (in milliseconds)

mongoose
 .connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 })
 .then(() => {
  console.log("Connection Successful!");
 })
 .catch((err) => {
  console.log("Connection Unsuccessful:", err);
 });
