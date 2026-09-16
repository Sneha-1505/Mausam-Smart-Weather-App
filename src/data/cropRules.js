export const CROP_RULES = {
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    type: 'Rabi',
    sowingSeasons: {
      default: { startMonth: 10, endMonth: 12 }
    },
    temperature: { min: 10, max: 25, optimalMin: 15, optimalMax: 20 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 20, maxWeekly: 50 },
    windTolerance: { maxKmph: 25 },
    humidity: { min: 40, max: 70 },
    waterloggingRiskThreshold: { consecutiveRainDays: 3, rainfallThreshold: 40 },
    guidance: 'Wheat requires cool weather during early growth and warm, dry weather during maturity. Avoid sowing if heavy rain is expected within 48 hours.'
  },
  rice: {
    id: 'rice',
    name: 'Rice',
    type: 'Kharif',
    sowingSeasons: {
      default: { startMonth: 6, endMonth: 7 }
    },
    temperature: { min: 20, max: 35, optimalMin: 22, optimalMax: 32 },
    soilMoisturePreference: 'moist',
    rainfallTolerance: { maxDaily: 100, maxWeekly: 300 },
    windTolerance: { maxKmph: 30 },
    humidity: { min: 60, max: 90 },
    waterloggingRiskThreshold: { consecutiveRainDays: 10, rainfallThreshold: 200 },
    guidance: 'Rice thrives in waterlogged conditions. Best sown at the onset of monsoons.'
  },
  maize: {
    id: 'maize',
    name: 'Maize',
    type: 'Kharif',
    sowingSeasons: {
      default: { startMonth: 6, endMonth: 7 }
    },
    temperature: { min: 15, max: 32, optimalMin: 21, optimalMax: 27 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 30, maxWeekly: 100 },
    windTolerance: { maxKmph: 25 },
    humidity: { min: 50, max: 80 },
    waterloggingRiskThreshold: { consecutiveRainDays: 3, rainfallThreshold: 50 },
    guidance: 'Maize is sensitive to waterlogging. Ensure good drainage.'
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    type: 'Kharif',
    sowingSeasons: {
      default: { startMonth: 4, endMonth: 5 }
    },
    temperature: { min: 21, max: 35, optimalMin: 25, optimalMax: 30 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 25, maxWeekly: 60 },
    windTolerance: { maxKmph: 20 },
    humidity: { min: 40, max: 70 },
    waterloggingRiskThreshold: { consecutiveRainDays: 2, rainfallThreshold: 30 },
    guidance: 'Cotton requires plenty of sunshine. Susceptible to frost and waterlogging.'
  },
  mustard: {
    id: 'mustard',
    name: 'Mustard',
    type: 'Rabi',
    sowingSeasons: {
      default: { startMonth: 10, endMonth: 11 }
    },
    temperature: { min: 10, max: 25, optimalMin: 15, optimalMax: 20 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 15, maxWeekly: 40 },
    windTolerance: { maxKmph: 25 },
    humidity: { min: 40, max: 60 },
    waterloggingRiskThreshold: { consecutiveRainDays: 2, rainfallThreshold: 30 },
    guidance: 'Mustard prefers cool, dry weather. Good for intercropping with wheat.'
  },
  potato: {
    id: 'potato',
    name: 'Potato',
    type: 'Rabi',
    sowingSeasons: {
      default: { startMonth: 10, endMonth: 11 }
    },
    temperature: { min: 10, max: 25, optimalMin: 15, optimalMax: 20 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 20, maxWeekly: 50 },
    windTolerance: { maxKmph: 20 },
    humidity: { min: 50, max: 80 },
    waterloggingRiskThreshold: { consecutiveRainDays: 2, rainfallThreshold: 30 },
    guidance: 'Potatoes grow best in loose, well-drained soil. Tuber growth stops above 30°C.'
  },
  sugarcane: {
    id: 'sugarcane',
    name: 'Sugarcane',
    type: 'Annual',
    sowingSeasons: {
      default: { startMonth: 1, endMonth: 3 }
    },
    temperature: { min: 20, max: 35, optimalMin: 25, optimalMax: 32 },
    soilMoisturePreference: 'moist',
    rainfallTolerance: { maxDaily: 50, maxWeekly: 150 },
    windTolerance: { maxKmph: 30 },
    humidity: { min: 60, max: 85 },
    waterloggingRiskThreshold: { consecutiveRainDays: 5, rainfallThreshold: 100 },
    guidance: 'Sugarcane has a long growing season and high water requirement.'
  },
  pulses: {
    id: 'pulses',
    name: 'Pulses',
    type: 'Rabi/Kharif',
    sowingSeasons: {
      default: { startMonth: 6, endMonth: 10 }
    },
    temperature: { min: 15, max: 30, optimalMin: 20, optimalMax: 25 },
    soilMoisturePreference: 'dry',
    rainfallTolerance: { maxDaily: 15, maxWeekly: 40 },
    windTolerance: { maxKmph: 20 },
    humidity: { min: 40, max: 60 },
    waterloggingRiskThreshold: { consecutiveRainDays: 1, rainfallThreshold: 20 },
    guidance: 'Pulses are hardy and require less water. Very sensitive to waterlogging.'
  },
  vegetables: {
    id: 'vegetables',
    name: 'Vegetables',
    type: 'All Seasons',
    sowingSeasons: {
      default: { startMonth: 1, endMonth: 12 }
    },
    temperature: { min: 15, max: 30, optimalMin: 18, optimalMax: 25 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 20, maxWeekly: 50 },
    windTolerance: { maxKmph: 15 },
    humidity: { min: 50, max: 70 },
    waterloggingRiskThreshold: { consecutiveRainDays: 2, rainfallThreshold: 30 },
    guidance: 'Vegetable requirements vary greatly. Generally need well-drained soil and consistent moisture.'
  },
  other: {
    id: 'other',
    name: 'Other',
    type: 'Unknown',
    sowingSeasons: {
      default: { startMonth: 1, endMonth: 12 }
    },
    temperature: { min: 10, max: 35, optimalMin: 18, optimalMax: 28 },
    soilMoisturePreference: 'moderate',
    rainfallTolerance: { maxDaily: 25, maxWeekly: 60 },
    windTolerance: { maxKmph: 25 },
    humidity: { min: 40, max: 80 },
    waterloggingRiskThreshold: { consecutiveRainDays: 3, rainfallThreshold: 50 },
    guidance: 'Generic parameters applied. Please check crop-specific advisories.'
  }
};

export const getCropRule = (cropId) => {
  return CROP_RULES[cropId?.toLowerCase()] || CROP_RULES.other;
};
