const Event = require('../models/event');
const User = require('../models/user');
const {transformEvent} = require('./common');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map(event => transformEvent(event))
        }catch(err){
            throw err;
        }

    },
    createEvent: async ({eventInput}, request) => {
        if(!request.isAuth){
            throw new Error("Unauthenticated. Try again");
        }
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(),
            creator: request.userId
        });
        try {
            let createdEvents;
            const result = await event.save();
            createdEvents = transformEvent(result);
            const creator = await User.findById(request.userId);

            if (!creator) {
                throw new Error('User does not exist')
            }
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvents;
        }catch(err){
            throw err;
        }
    }
};