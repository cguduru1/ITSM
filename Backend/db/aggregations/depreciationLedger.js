// Straight-line depreciation over 36 months default
export const depreciationPipeline = (months = 36) => [
  {
    $lookup: {
      from: "financiallifecycles",
      localField: "assetId",
      foreignField: "assetId",
      as: "financial"
    }
  },
  { $unwind: "$financial" },
  {
    $lookup: {
      from: "productcatalogs",
      localField: "modelId",
      foreignField: "modelId",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $addFields: {
      ageMonths: {
        $max: [
          0,
          {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$financial.purchaseDate"] },
                1000 * 60 * 60 * 24 * 30
              ]
            }
          }
        ]
      }
    }
  },
  {
    $addFields: {
      dynamicBookValue: {
        $cond: [
          { $gte: ["$ageMonths", months] },
          "$financial.residualValue",
          {
            $round: [
              {
                $subtract: [
                  "$financial.purchaseCost",
                  {
                    $multiply: [
                      { $divide: [{ $subtract: ["$financial.purchaseCost", "$financial.residualValue"] }, months] },
                      "$ageMonths"
                    ]
                  }
                ]
              },
              2
            ]
          }
        ]
      }
    }
  },
  {
    $project: {
      assetId: 1,
      assetTag: 1,
      serialNumber: 1,
      "product.manufacturer": 1,
      "product.modelName": 1,
      "financial.purchaseDate": 1,
      "financial.purchaseCost": 1,
      "financial.residualValue": 1,
      ageMonths: 1,
      dynamicBookValue: 1
    }
  }
];
