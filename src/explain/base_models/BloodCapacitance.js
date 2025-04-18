import { Capacitance } from "./Capacitance";

export class BloodCapacitance extends Capacitance {
  // static properties
  static model_type = "BloodCapacitance";
  model_interface = [
    {
      caption: "model is enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      factor: 1000.0,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance baseline (mmHg/mL)",
      target: "el_base",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "temperature (C)",
      target: "temp",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "viscosity (cP)",
      target: "viscosity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor"
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor"
    },
  ];
  
  constructor(model_ref, name = "") {
    super(model_ref, name);


    // initialize addtional independent properties
    this.temp = 0.0; // blood temperature (dgs C)
    this.viscosity = 6.0; // blood viscosity (centiPoise = Pa * s)
    this.solutes = {}; // dictionary holding all solutes
    this.drugs = {}; // dictionary holding all drug concentrations

    // initialize additional dependent properties
    this.to2 = 0.0; // total oxygen concentration (mmol/l)
    this.tco2 = 0.0; // total carbon dioxide concentration (mmol/l)
    this.ph = -1.0; // ph (unitless)
    this.pco2 = -1.0; // pco2 (mmHg)
    this.po2 = -1.0; // po2 (mmHg)
    this.so2 = -1.0; // o2 saturation
    this.hco3 = -1.0; // bicarbonate concentration (mmol/l)
    this.be = -1.0; // base excess (mmol/l)
  }
  
  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;

    // process the gases o2 and co2
    this.to2 += ((comp_from.to2 - this.to2) * dvol) / this.vol;
    this.tco2 += ((comp_from.tco2 - this.tco2) * dvol) / this.vol;

    // process the solutes
    Object.keys(this.solutes).forEach((solute) => {
      this.solutes[solute] +=
        ((comp_from.solutes[solute] - this.solutes[solute]) * dvol) / this.vol;
    });
  }
}
