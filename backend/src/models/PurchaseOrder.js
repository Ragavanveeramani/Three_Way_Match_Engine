import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
    itemCode:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    skuMaster:{
        type:mongoose.Schema.Types.ObjectId,ref:'skuMaster',default:null
    }
});

const purchaseOrderSchema = new mongoose.Schema({
    poNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    poDate:{
        type:String,
        required:true
    },
    vendorName:{
        type:String,
        required:true
    },
    items:[poItemSchema],
    filePath:{
        type:String,
        required:true
    },
    rawParsed:{
        type:Object
    }
},{timestamps:true});

export default mongoose.model('PurchaseOrder',purchaseOrderSchema);