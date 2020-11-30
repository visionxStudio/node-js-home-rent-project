const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: { 
        type: String,
        required: true
    },
    address: { 
        type: String,
        required: true
    },
    roomRent: { 
        type: Number,
        required: true
    },
    wifi: { 
        type: Number,
        required: true
    },
    water: { 
        type: Number,
        required: true
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: 'true'
    }
});


module.exports = mongoose.model('Client', clientSchema);