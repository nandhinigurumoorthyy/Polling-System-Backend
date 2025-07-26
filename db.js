const mongoose = require("mongoose");

const mongoDBURI = `mongodb+srv://nandhinigurumoorthy2003:tNvqoqXJPBVjogAr@poll.p8eos8t.mongodb.net/poll?retryWrites=true&w=majority&appName=poll`

async function createDbConnection() {
  try {
    await mongoose.connect(mongoDBURI);
    console.log("connection established !!!---");
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  createDbConnection,
};