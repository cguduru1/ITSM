import ProcurementRequest from "../models/ProcurementRequest.js";

export const updateProcurementStatus = async (id, status) => {
  const req = await ProcurementRequest.findById(id);
  req.status = status;
  await req.save();
  return req;
};
