import Joi from "joi";

export const createAssetSchema = Joi.object({
  assetTag: Joi.string().trim().required().messages({
    "string.empty": "Asset Tag cannot be empty",
    "any.required": "Asset Tag is a required field"
  }),
  
  serialNumber: Joi.string().trim().allow("", null).optional(),
  
  modelId: Joi.string().trim().required().messages({
    "string.empty": "Model ID is required"
  }),

  description: Joi.string().trim().required().messages({
    "string.empty": "Description is required"
  }),
  
  category: Joi.string()
    .valid("Laptop", "Server", "Network", "Hardware", "Software")
    .required(),
    
  status: Joi.string()
    .valid("Active", "In-Stock", "Retired", "Maintenance", "Disposed")
    .default("Active")
}).unknown(true); // Allows optional extra metadata fields without failing validation