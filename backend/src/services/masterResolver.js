import  SkuMaster from '../models/SkuMaster.js';

/**
 * Resolves a raw itemCode against the SkuMaster database.
 * Trims whitespace and ignores case.
 */
const resolveItemMaster = async (itemCode) => {
  if (!itemCode) return null;

  const normalizedCode = itemCode.toString().trim();

  // 1. Try matching by skuErpCode
  let master = await SkuMaster.findOne({
    skuErpCode: { $regex: new RegExp(`^${normalizedCode}$`, 'i') }
  });

  // 2. Fallback: Try matching by eanCode
  if (!master) {
    master = await SkuMaster.findOne({
      eanCode: { $regex: new RegExp(`^${normalizedCode}$`, 'i') }
    });
  }

  return master ? master._id : null;
};

export    {resolveItemMaster} ;