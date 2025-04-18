import { BaseModelClass } from "./BaseModelClass";
import { calc_blood_composition } from "../helpers/BloodComposition"

export class BloodDiffusor extends BaseModelClass {
  // static properties
  static model_type = "BloodDiffusor";
  model_interface = [
    {
      caption: "oxygen diffusion constant",
      target: "dif_o2",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 3,
    },
    {
      caption: "carbon dioxide diffusion constant",
      target: "dif_co2",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 3,
    },
    {
      caption: "blood component 1",
      target: "comp_blood1",
      type: "list",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", "BloodVessel", 
        "Artery", 
        "Arteriole", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber", 
        "Vein", 
        "Venule"
      ]
    },
    {
      caption: "blood component 2",
      target: "comp_blood2",
      type: "list",
      options: [
        "BloodCapacitance", 
        "BloodTimeVaryingElastance", 
        "BloodPump", "BloodVessel", 
        "Artery", 
        "Arteriole", 
        "CapillaryBed", 
        "CoronaryVessel", 
        "HeartChamber", 
        "Vein", 
        "Venule"
      ]
    }

  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.comp_blood1 = "PLF"; // name of the first blood-containing model
    this.comp_blood2 = "PLM"; // name of the second blood-containing model
    this.dif_o2 = 0.01; // diffusion constant for o2 (mmol/mmHg * s)
    this.dif_co2 = 0.01; // diffusion constant for co2 (mmol/mmHg * s)
    this.dif_solutes = {}; // diffusion constants for the different solutes (mmol/mmol * s)

    // factors
    this.dif_o2_factor = 1.0;
    this.dif_co2_factor = 1.0;
    this.dif_solutes_factor = 1.0;

    // local variables
    this._comp_blood1 = null; // reference to the first blood-containing model
    this._comp_blood2 = null; // reference to the second blood-containing model
  }

  calc_model() {
    // find the two blood-containing models and store references
    this._comp_blood1 = this._model_engine.models[this.comp_blood1];
    this._comp_blood2 = this._model_engine.models[this.comp_blood2];

    // calculate the blood composition of the blood components in this diffusor as we need the partial pressures for the gas diffusion
    calc_blood_composition(this._comp_blood1);
    calc_blood_composition(this._comp_blood2);

    // incorporate the factors
    let _dif_o2 = this.dif_o2 * this.dif_o2_factor;
    let _dif_co2 = this.dif_co2 * this.dif_co2_factor;

    // diffuse the gases, where diffusion is partial pressure-driven
    let do2 = (this._comp_blood1.po2 - this._comp_blood2.po2) * _dif_o2 * this._t;
    // update the concentrations
    this._comp_blood1.to2 = (this._comp_blood1.to2 * this._comp_blood1.vol - do2) / this._comp_blood1.vol;
    this._comp_blood2.to2 = (this._comp_blood2.to2 * this._comp_blood2.vol + do2) / this._comp_blood2.vol;

    let dco2 = (this._comp_blood1.pco2 - this._comp_blood2.pco2) * _dif_co2 * this._t;
    // update the concentrations
    this._comp_blood1.tco2 = (this._comp_blood1.tco2 * this._comp_blood1.vol - dco2) / this._comp_blood1.vol;
    this._comp_blood2.tco2 = (this._comp_blood2.tco2 * this._comp_blood2.vol + dco2) / this._comp_blood2.vol;

    // diffuse the solutes, where the diffusion is concentration gradient-driven
    Object.keys(this.dif_solutes).forEach((sol) => {
      let dif = this.dif_solutes[sol] * this.dif_solutes_factor;
      let dsol = (this._comp_blood1.solutes[sol] - this._comp_blood2.solutes[sol]) * dif * this._t;
      // update the concentration
      this._comp_blood1.solutes[sol] = (this._comp_blood1.solutes[sol] * this._comp_blood1.vol - dsol) / this._comp_blood1.vol;
      this._comp_blood2.solutes[sol] = (this._comp_blood2.solutes[sol] * this._comp_blood2.vol + dsol) / this._comp_blood2.vol;
    });
  }
}
