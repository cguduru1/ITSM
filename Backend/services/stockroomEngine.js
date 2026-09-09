import Stockroom from "../models/Stockroom.js";

export async function stockroomEngine() {
  try {
    const stock = await Stockroom.find();
    return stock;
  } catch (err) {
    console.error("STOCKROOM ENGINE ERROR:", err);
    return [];
  }
}
