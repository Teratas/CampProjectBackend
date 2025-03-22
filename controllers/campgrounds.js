//@desc Get all campgrounds
//@route GET /api/v1/campgrounds

const Campground = require("../models/Campground");
const Booking = require("../models/Booking.js");

//@access Public
exports.getCampgrounds= async(req,res,next)=>{
    try{
        let query;
        // copy req query in to array key val
        const reqQ = {...req.query};
        console.log(reqQ)

        //field to exclude
        const removeFields=['select', 'sort', 'page', 'limit'];

        //loop over to remove field adn delete from reqQ
        removeFields.forEach(param=>delete reqQ[param]);
        console.log(reqQ);

        let queryString = JSON.stringify(reqQ);
        queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

        query = Campground.find(JSON.parse(queryString)).populate('bookings');

        //select fields
        if(req.query.select){
            const fields=req.query.select.split(',').join(' ');
            query=query.select(fields);
        }
        //sort
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(' ');
            query=query.sort(sortBy);
        } else{
            query=query.sort('createdAt');
        }
        //Pagination
        const page=parseInt(req.query.page,10)||1;
        const limit=parseInt(req.query.limit,10)||25;
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;
        const total=await Campground.countDocuments();

        query=query.skip(startIndex).limit(limit);

        //execute query
        const campgrounds = await query;

        //paginatin result
        const pagination ={};
        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({success:true, count:campgrounds.length, pagination, data:campgrounds});
    } catch(err){
        console.log(err)
        res.status(400).json({success:false});
    };
    
};

//@desc Get single campground
//@route GET /api/v1/campgrounds/:id
//@access Public
exports.getCampground=async(req,res,next)=>{
    try{
        const campground = await Campground.findById(req.params.id);
        
        if(!campground){
            return res.status(400).json({success: false});
        }
        res.status(200).json({success: true, data: campground});
    } catch(err){
        res.status(400).json({success: false});
    };
    
};

//@desc Create a campground
//@route POST /api/v1/campgrounds
//@access Private
exports.createCampground= async (req,res,next)=>{
    // console.log(req.body);
    try{
        const campground = await Campground.create(req.body);
        res.status(201).json({success:true, data:campground});
    } catch(err){
        res.status(400).json({success:false, message: 'Cannot create campground.'});
    }
    
};

//@desc Update single campground
//@route PUT /api/v1/campgrounds/:id
//@access Private
exports.updateCampground= async(req,res,next)=>{
    try{
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body,{
            new: true,
            runValidators: true
        })
        if(!campground){
            return res.status(400).json({success: false});
        }
        res.status(200).json({success:true, data: campground});
    } catch(err){
        res.status(400).json({success:false});
    }
};

//@desc Delete single campground
//@route DELETE /api/v1/campgrounds/:id
//@access Private
exports.deleteCampground= async (req,res,next)=>{
    try{
        const campground = await Campground.findById(req.params.id);
        if(!campground){
            return res.status(400).json({success: false});
        }
        //delete appointment first
        await Booking.deleteMany({campground: req.params.id});
        //delete campground
        await Campground.deleteOne({_id: req.params.id});
        res.status(200).json({success:true, data: {}});
    } catch(err) {
        return res.status(400).json({success: false});
    }
};