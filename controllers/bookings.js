const Booking = require('../models/Booking');
const Campground = require('../models/Campground');
const { findById } = require('../models/Campground');
const MAX_NIGHT = 3;

function validateDate(startDate, endDate){
    const currentDate = new Date();
    if(startDate < currentDate){
        return false;
    }

    const dayDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    
    if(dayDiff <= MAX_NIGHT && dayDiff > 0){
        return true;
    }
    return false;
}

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Public
exports.getBookings=async(req,res,next)=>{
    let query;
    //general user only see their bookings
    if(req.user.role !== 'admin'){
        query=Booking.find({user:req.user.id}).populate({
            path:'campground',
            select: 'name tel'
        });
    }else{
        if(req.params.campgroundId){
            console.log(req.params.campgroundId);
            query=Booking.find({campground:req.params.campgroundId}).populate({
                path:'campground',
                select: 'name tel'
            });
        }else {
            query=Booking.find().populate({
            path:'campground',
            select: 'name tel'
        });
        }   
    }
    try{
        const bookings = await query;

        res.status(200).json({
            success:true,
            count:bookings.length,
            data:bookings
        });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false, message:"Cannot find Booking"});
    }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Public
exports.getBooking=async(req,res,next)=>{
    try{
        const booking = await Booking.findById(req.params.id).populate({
            path: 'campground',
            select: 'name address tel'
        });

        if(!booking){
            return res.status(404).json({success: false, message:`No booking with the id of ${req.params.id}`})
        }

        res.status(200).json({
            success:true,
            data:booking
        });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false, message:"Cannot find Booking"});
    }
};

//@desc     Add booking
//@route    POST /api/v1/campgrounds/:campgroundId/bookings
//@access   Private
exports.addBooking=async(req,res,next)=>{
    try{
        req.body.campground = req.params.campgroundId;

        const campground = await Campground.findById(req.params.campgroundId);

        if(!campground){
            return res.status(404).json({success: false, message:`No campground with the id of ${req.params.campgroundId}`});
        }
        
        //check up to 3 nights (4 day)
        if(!req.body.startDate || !req.body.endDate){
            return res.status(404).json({success: false, message:'Please specify start and end of booking.'})
        }

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if(!validateDate(startDate, endDate)){
            return res.status(404).json({success: false, message:'Can book only 1-3 nights, start from today.'})
        }

        //add userId to req.body
        req.body.user=req.user.id;

        //check for existed booking
        const existedBookings = await Booking.find({user: req.user.id});

        //If the user is not admin, they can only create 3 booking.
        if(existedBookings.length >=3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message:`The user with ID ${req.user.id} has already made 3 bookings`})
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success:true,
            data:booking
        });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false, message:"Cannot create Booking"});
    }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking=async(req,res,next)=>{
    try{
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success: false, message:`No booking with the id of ${req.params.id}`})
        }

        //make sure user is the booking owner
        if(booking.user.toString()!==req.user.id && req.user.role !=='admin'){
            return res.status(401).json({success: false, message:`User ${req.user.id} is not authorized to update this booking`})
        }

        //verify date check up to 3 nights (4 day)
        if(!req.body.startDate || !req.body.endDate){
            return res.status(404).json({success: false, message:'Please specify start and end of booking.'})
        }

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if(!validateDate(startDate, endDate)){
            return res.status(404).json({success: false, message:'Can book only 1-3 nights, start from today.'})
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success:true,
            data:booking
        });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false, message:"Cannot update Booking"});
    }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking=async(req,res,next)=>{
    try{
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success: false, message:`No booking with the id of ${req.params.id}`})
        }

        //make sure user is the booking owner
        if(booking.user.toString()!==req.user.id && req.user.role !=='admin'){
            return res.status(401).json({success: false, message:`User ${req.user.id} is not authorized to delete this booking`})
        }

        await booking.deleteOne();

        res.status(200).json({
            success:true,
            data:{}
        });
    }catch (err){
        console.log(err);
        return res.status(500).json({success:false, message:"Cannot delete Booking"});
    }
};