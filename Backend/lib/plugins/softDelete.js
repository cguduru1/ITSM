// // lib/plugins/softDelete.js
export default function softDeletePlugin(schema) {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  });

  // Query middleware
  schema.pre(["find", "findOne", "findOneAndUpdate", "count", "countDocuments"], function () {
    const q = this.getQuery();
    if (!q || Object.prototype.hasOwnProperty.call(q, "isDeleted")) {
      return;
    }
    this.where({ isDeleted: { $ne: true } });
  });

  // Aggregate middleware
   schema.pre("aggregate", function () {
    const pipeline = this.pipeline();
    const hasDeletedMatch = pipeline.some(
      stage => stage.$match && Object.prototype.hasOwnProperty.call(stage.$match, "isDeleted")
    );
    if (!hasDeletedMatch) {
      this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    }
  });

  // Instance methods
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
    return this;
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
    return this;
  };
}
