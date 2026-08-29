import mongoose from 'mongoose';

const grnItemSchema = new mongoose.Schema({
    itemCode:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    receivedQuantity:{
        type:Number,
        required:true
    },
    mrp:{
        type:Number
    },
    skuMaster:{
        type:mongoose.Schema.Types.ObjectId,ref:'SkuMaster',default:null
    }
});

const grnSchema = new mongoose.Schema({
    grnNumber:{
        type:String,
        required:true,
        trim:true
    },
    poNumber:{
        type:String,
        required:true,
        trim:true
    },
    grnDate:{
        type:String,required:true
    },
    items:[grnItemSchema],
    filePath:{
        type:String, required:true
    },
    rawParsed:{
       type:Object
    }
},{timestamps:true});

grnSchema.index({poNumber:1,grnNumber:1},{unique:true});

export default mongoose.model('Grn',grnSchema);