// Returns license utilization and compliance status
export const softwareCompliancePipeline = (matchActive = true) => [
  { $match: matchActive ? { isActive: true } : {} },
  {
    $lookup: {
      from: "softwareallocations",
      localField: "licenseId",
      foreignField: "licenseId",
      as: "allocations"
    }
  },
  {
    $addFields: {
      seatsAllocated: { $size: "$allocations" },
      availableSeats: { $subtract: ["$totalSeatsPurchased", { $size: "$allocations" }] }
    }
  },
  {
    $project: {
      licenseId: 1,
      softwareName: 1,
      publisher: 1,
      licenseType: 1,
      totalSeatsPurchased: 1,
      seatsAllocated: 1,
      availableSeats: 1,
      complianceStatus: {
        $switch: {
          branches: [
            { case: { $lt: ["$availableSeats", 0] }, then: "NON-COMPLIANT" },
            { case: { $eq: ["$availableSeats", 0] }, then: "AT CAPACITY" }
          ],
          default: "COMPLIANT"
        }
      }
    }
  }
];
