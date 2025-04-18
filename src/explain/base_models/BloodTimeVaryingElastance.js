import { TimeVaryingElastance } from "./TimeVaryingElastance";

export class BloodTimeVaryingElastance extends TimeVaryingElastance {
  // static properties
  static model_type = "BloodTimeVaryingElastance";
  model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.temp = 0.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // dictionary holding all solutes
    this.drugs = {}; // dictionary holding all drug concentrations

    // initialize dependent properties
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = 0.0; // ph
    this.pco2 = 0.0; // pco2 (mmHg)
    this.po2 = 0.0; // po2 (mmHg)
    this.so2 = 0.0; // o2 saturation
    this.hco3 = 0.0; // bicarbonate concentration (mmol/l)
    this.be = 0.0; // base excess (mmol/l)
  }

  // override the volume_in method
  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;

    // process the gases
    this.to2 += ((comp_from.to2 - this.to2) * dvol) / this.vol;
    this.tco2 += ((comp_from.tco2 - this.tco2) * dvol) / this.vol;

    // process the solutes
    Object.keys(this.solutes).forEach((solute) => {
      this.solutes[solute] +=
        ((comp_from.solutes[solute] - this.solutes[solute]) * dvol) / this.vol;
    });
  }
}
