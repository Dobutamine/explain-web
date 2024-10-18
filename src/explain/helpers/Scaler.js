export class Scaler {
  constructor(model_ref) {
    // Initialize independent properties
    this.referenceWeight = 3.545; // reference weight for global scaling factor (kg)
    this.weight = 3.545; // current weight (kg)
    this.height = 0.5; // current height (m)

    // General scalers
    this.globalScaleFactor = 1.0; // global scaling factor
    this.totalBloodVolumeKg = 0.0; // total blood volume (L/kg)
    this.totalGasVolumeKg = 0.0; // total gas volume (L/kg)

    // Reference heartrate and pressures
    this.hrRef = 125;
    this.mapRef = 50;

    // Scaling factors for breathing, metabolism, and cardiovascular system
    this.minuteVolumeRefScalingFactor = 1.0;
    this.vtRrRatioScalingFactor = 1.0;
    this.vo2ScalingFactor = 1.0;
    this.respQScalingFactor = 1.0;

    // Scaling factors of the heart and circulation
    this.elMinAtrialFactor = 1.0;
    this.elMaxAtrialFactor = 1.0;
    this.elMinVentricularFactor = 1.0;
    this.elMaxVentricularFactor = 1.0;
    this.elMinCorFactor = 1.0;
    this.elMaxCorFactor = 1.0;
    this.elBasePericardiumFactor = 1.0;
    this.elBaseSystArtFactor = 1.0;
    this.elBaseSystVenFactor = 1.0;
    this.elBasePulmArtFactor = 1.0;
    this.elBasePulmVenFactor = 1.0;
    this.elBaseCapFactor = 1.0;
    this.elBaseDaFactor = 1.0;

    this.uVolAtrialFactor = 1.0;
    this.uVolVentricularFactor = 1.0;
    this.uVolCorFactor = 1.0;
    this.uVolPericardiumFactor = 1.0;
    this.uVolSystArtFactor = 1.0;
    this.uVolSystVenFactor = 1.0;
    this.uVolPulmArtFactor = 1.0;
    this.uVolPulmVenFactor = 1.0;
    this.uVolCapFactor = 1.0;
    this.uVolDaFactor = 1.0;

    this.rValveFactor = 1.0;
    this.rCorFactor = 1.0;
    this.rSystArtFactor = 1.0;
    this.rSystVenFactor = 1.0;
    this.rPulmArtFactor = 1.0;
    this.rPulmVenFactor = 1.0;
    this.rShuntsFactor = 1.0;
    this.rDaFactor = 1.0;

    // Scaling factors of the lungs and chestwall
    this.elBaseLungsFactor = 1.0;
    this.elBaseDsFactor = 1.0;
    this.elBaseCwFactor = 1.0;
    this.elBaseThoraxFactor = 1.0;

    this.uVolLungsFactor = 1.0;
    this.uVolDsFactor = 1.0;
    this.uVolCwFactor = 1.0;
    this.uVolThoraxFactor = 1.0;

    this.rUpperAirwayFactor = 1.0;
    this.rLowerAirwayFactor = 1.0;

    // Initialize dependent properties
    // Initialize local properties
    this._modelEngine = model_ref; // object holding a reference to the model engine
    this._t = model_ref.modelingStepsize; // modeling stepsize
    this._bloodContainingModeltypes = [
      "BloodCapacitance",
      "BloodTimeVaryingElastance",
    ];
  }

  loadScalerSettings(scalerSettings) {
    // Set the properties of this model
    for (const [key, value] of Object.entries(scalerSettings)) {
      this[key] = value;
    }

    // Scale the patient according to the settings
    this.scalePatient(
      this.weight,
      this.hrRef,
      this.mapRef,
      this.totalBloodVolumeKg,
      this.totalGasVolumeKg
    );
  }

  scalePatient(
    newWeight,
    hrRef,
    mapRef,
    newBloodVolumeKg = 0.08,
    newGasVolumeKg = 0.04
  ) {
    // Calculate the global weight-based scaling factor
    this.globalScaleFactor = newWeight / this.referenceWeight;

    // Store the new properties
    this._modelEngine.weight = newWeight;
    this.weight = newWeight;
    this.hrRef = hrRef;
    this.mapRef = mapRef;

    // Scale the blood volume
    this.scaleBloodVolume(newBloodVolumeKg);

    // Scale the gas volume
    this.scaleGasVolume(newGasVolumeKg);

    // Scale heart and other systems
    this.scaleHeart();
    this.scaleHeartValves();
    this.scalePericardium();
    this.scaleCorResistors();
    this.scaleSystArteries();
    this.scaleSystArtResistors();
    this.scalePulmArteries();
    this.scalePulmArtResistors();
    this.scaleCapillaries();
    this.scaleSystVeins();
    this.scaleSystVenResistors();
    this.scalePulmVeins();
    this.scalePulmVenResistors();
    this.scaleShunts();
    this.scaleDuctusArteriosus();
    this.scaleDuctusArtResistors();
    this.scaleThorax();
    this.scaleChestwall();
    this.scaleLungs();
    this.scaleDeadSpace();
    this.scaleUpperAirways();
    this.scaleLowerAirways();
    this.scaleAnsHr(this.hrRef);
    this.scaleAnsMap(this.mapRef);
    this.scaleBreathing();
    this.scaleMetabolism();
    this.scaleMob();

    // Print scaling report
    console.log(
      `Scaling model to ${newWeight} kg => factor ${this.globalScaleFactor.toFixed(
        4
      )}`
    );
    console.log(
      `Scaling blood volume to ${newBloodVolumeKg} L/kg = ${(
        this.totalBloodVolumeKg * this._modelEngine.weight
      ).toFixed(4)} L`
    );
    console.log(
      `Scaling lung volume to ${newGasVolumeKg} L/kg = ${(
        this.totalGasVolumeKg * this._modelEngine.weight
      ).toFixed(4)} L`
    );
  }

  scaleBloodVolume(newBloodVolumeKg) {
    const currentBloodVolume = this.getTotalBloodVolume();
    const targetBloodVolume = newBloodVolumeKg * this._modelEngine.weight;
    const scaleFactor = targetBloodVolume / currentBloodVolume;

    for (const model of Object.values(this._modelEngine.models)) {
      if (this._bloodContainingModeltypes.includes(model.modelType)) {
        model.vol *= scaleFactor;
        model.uVol *= scaleFactor;
      }
    }

    this.totalBloodVolumeKg =
      this.getTotalBloodVolume() / this._modelEngine.weight;
  }

  getTotalBloodVolume() {
    let totalVolume = 0;
    for (const model of Object.values(this._modelEngine.models)) {
      if (
        this._bloodContainingModeltypes.includes(model.modelType) &&
        model.isEnabled
      ) {
        totalVolume += model.vol;
      }
    }
    return totalVolume;
  }

  scaleGasVolume(newGasVolumeKg) {
    const currentGasVolume = this.getTotalGasVolume();
    const targetGasVolume = newGasVolumeKg * this._modelEngine.weight;
    const scaleFactor = targetGasVolume / currentGasVolume;

    for (const model of Object.values(this._modelEngine.models)) {
      if (["ALL", "ALR", "DS"].includes(model.name)) {
        model.vol *= scaleFactor;
        model.uVol *= scaleFactor;
      }
    }

    this.totalGasVolumeKg = this.getTotalGasVolume() / this._modelEngine.weight;
  }

  getTotalGasVolume() {
    let totalVolume = 0;
    for (const model of Object.values(this._modelEngine.models)) {
      if (["ALL", "ALR", "DS"].includes(model.name) && model.isEnabled) {
        totalVolume += model.vol;
      }
    }
    return totalVolume;
  }

  scaleAnsHr(newHrRef) {
    this.hrRef = newHrRef;
    this.scaleAns(this.hrRef, this.mapRef);
  }

  scaleAnsMap(newMapRef) {
    this.mapRef = newMapRef;
    this.scaleAns(this.hrRef, this.mapRef);
  }

  scaleAns(hrRef, mapRef) {
    this.hrRef = hrRef;
    this.mapRef = mapRef;
    this._modelEngine.models["Heart"].heartRateRef = this.hrRef;

    for (const baro of this._modelEngine.modelGroups["baroreceptor"]) {
      baro.minValue = this.mapRef / 2.0;
      baro.setValue = this.mapRef;
      baro.maxValue = this.mapRef * 2.0;
    }
  }

  scaleBreathing() {
    this._modelEngine.models["Breathing"].minuteVolumeRefScalingFactor =
      this.minuteVolumeRefScalingFactor;
    this._modelEngine.models["Breathing"].vtRrRatioScalingFactor =
      this.vtRrRatioScalingFactor;
  }

  scaleMetabolism() {
    this._modelEngine.models["Metabolism"].vo2ScalingFactor =
      this.vo2ScalingFactor;
    this._modelEngine.models["Metabolism"].respQScalingFactor =
      this.respQScalingFactor;
  }

  scaleMob() {
    // The MOB model is already weight-based
  }

  // Similar scale functions for heart, valves, vessels, and other systems go here...
}
