const Booking = require('../models/booking');
const Event = require('../models/event');
const {transformBooking, transformEvent} = require('./common');


module.exports = {
    bookings: async (args, request) => {
        if(!request.isAuth){
            throw new Error('Unauthenticated');
        }
        try{
            const bookings = await Booking.find();
            return bookings.map(booking => transformBooking(booking))
        }
        catch(err){
            throw err;
        }
    },
    bookEvent: async (args,request) => {
        if(!request.isAuth){
            throw new Error('Unauthenticated');
        }
        const fetchedEvent = await Event.findOne({_id:args.eventId});
        const booking = new Booking({
            user: request.userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return transformBooking(result);
    },
    cancelBooking: async (args,request) => {
        if(!request.isAuth){
            throw new Error('Unauthenticated');
        }
        try{
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({_id: args.bookingId});
            return event;

        }catch(err){
            throw err;
        }
    }
};