const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: mongoose.SchemaTypes.String,
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    startLive: mongoose.SchemaTypes.String,
    endLive: mongoose.SchemaTypes.String,
    status: mongoose.SchemaTypes.String
});

// Compiles the UserSchema into a model to use for interaction with DB
module.exports = mongoose.model("Livestreams", UserSchema);
