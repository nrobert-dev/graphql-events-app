const bcrypt = require('bcryptjs');
const Event = require('../models/event');
const User = require('../models/user');
const Booking = require('../models/booking');


const user = async (userId) => {
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc, _id: user.id,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    }catch(err){
        throw err;
    }
};

const events = async eventIds => {
    try {
        const events = await Event.find({_id: {$in: eventIds}});
        return events.map(event => {
            return {...event._doc, _id: event.id, creator: user.bind(this, event.creator)}
        });
    }
    catch(err){
        throw err;
    }
};

const singleEvent = async eventId => {
    try{
        const event = await Event.findById(eventId);
        return {...event._doc, _id: event.id, creator: user.bind(this, event.creator)}
    }catch(err){
        throw err;
    }
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find()
            return events.map(event => ({
                ...event._doc, _id: event.id,
                creator: user.bind(this, event._doc.creator)
            }))
        }catch(err){
            throw err;
        }

    },
    bookings: async () => {
       try{
           const bookings = await Booking.find();
           return bookings.map(booking => ({...booking,
               _id:booking.id,
               user: user.bind(this, booking._doc.user),
               event: singleEvent.bind(this,booking._doc.event),
               createdAt: new Date(booking._doc.createdAt).toISOString(),
               updatedAt: new Date(booking._doc.updatedAt).toISOString()
           }));
       }
        catch(err){
           throw err;
       }
    },
    createEvent: async ({eventInput}) => {
        const event = new Event({
            title: eventInput.title,
            description: eventInput.description,
            price: +eventInput.price,
            date: new Date(),
            creator: '5f5f4fa1997c651d2cebd96f'
        });
        try {
            let createdEvents;
            const result = await event.save();
            createdEvents = {
                ...result._doc,
                _id: result._doc._id.toString
            };
            const creator = await User.findById('5f5f4fa1997c651d2cebd96f');

            if (!creator) {
                throw new Error('User does not exist')
            }
            creator.createdEvents.push(event);
            await creator.save();

            return createdEvents;
        }catch(err){
            throw err;
        }
    },
    createUser: async ({userInput}) => {
        try {
            const searchedUser = User.findOne({email: userInput.email});
            if (searchedUser) {
                throw new Error('User exists already.')
            }
            const hashedPassword = await bcrypt.hash(userInput.password, 12);
            const user = new User({
                email: userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return {...result._doc, password: null, _id: result.id};
        }catch(err){
            throw err;
        }
    },
    bookEvent: async args => {
        const fetchedEvent = await Event.findOne({_id:args.eventId});
        const booking = new Booking({
            user: '5f5f4fa1997c651d2cebd96f',
            event: fetchedEvent
        });
        const result = await booking.save();
        return {...result._doc, _id: result.id,
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updatedAt: new Date(result._doc.updatedAt).toISOString(),
            user: user.bind(this, booking._doc.user),
            event: singleEvent.bind(this,booking._doc.event),
        }
    },
    cancelBooking: async args => {
        try{
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = {...booking.event._doc, _id:booking.event.id, creator:user.bind(this,booking.event._doc.creator)};
            await Booking.deleteOne({_id: args.bookingId});
            return event;

        }catch(err){
            throw err;
        }
    }
};