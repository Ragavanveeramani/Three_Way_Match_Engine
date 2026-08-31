import mongoose from 'mongoose';

const skuMasterSchema = new mongoose.Schema({
    skuErpCode:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    name:{
        type:String,
        required:true
    },
    eanCode:{
        type:String,
        trim:true
    },
    hsnCode:{
        type:String,
        trim:true
    },
    uom:{
        type:String,
        default:'PKT'
    },
    agreedRate:{
        type:Number,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    priceTolerance:{
        type:Number,
        default:0.05
    }
},{timestamps:true});


export default mongoose.model('SkuMaster',skuMasterSchema);