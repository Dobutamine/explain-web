import { BaseModelClass } from "./BaseModelClass";
import { calc_gas_composition } from "../helpers/GasComposition"

export class GasDiffusor extends BaseModelClass {
  // static properties
  static model_type = "GasDiffusor";
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
      caption: "nitric oxide diffusion constant",
      target: "dif_n2",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 3,
    },
    {
      caption: "other gasses diffusion constant",
      target: "dif_other",
      type: "number",
      factor: 1.0,
      delta: 0.01,
      rounding: 3,
    },
    {
      caption: "gas component 1",
      target: "comp_gas1",
      type: "list",
      options: ["GasCapacitance", "AlveolarSpace"]
    },
    {
      caption: "gas component 2",
      target: "comp_gas2",
      type: "list",
      options: ["GasCapacitance", "AlveolarSpace"]
    }

  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.comp_gas1 = ""; // name of the first gas-containing model
    this.comp_gas2 = ""; // name of the second gas-containing model
    this.dif_o2 = 0.01; // diffusion constant for o2 (mmol/mmHg * s)
    this.dif_co2 = 0.01; // diffusion constant for co2 (mmol/mmHg * s)
    this.dif_n2 = 0.01; // diffusion constant for n2 (mmol/mmHg * s)
    this.dif_other = 0.01; // diffusion constant for n2 (mmol/mmHg * s)

    // factors
    this.dif_o2_factor = 1.0;
    this.dif_co2_factor = 1.0;
    this.dif_n2_factor = 1.0;
    this.dif_other_factor = 1.0

    // local variables
    this._comp_gas1 = null; // reference to the first gas-containing model
    this._comp_gas2 = null; // reference to the second gas-containing model
  }

  calc_model() {
    // find the two blood-containing models and store references
    this._comp_gas1 = this._model_engine.models[this.comp_gas1];
    this._comp_gas2 = this._model_engine.models[this.comp_gas2];

    // calculate the gas composition of the gas components in this diffusor as we need the partial pressures for the gas diffusion
    calc_gas_composition(this._comp_gas1);
    calc_gas_composition(this._comp_gas2);

    // incorporate the factors
    let _dif_o2 = this.dif_o2 * this.dif_o2_factor;
    let _dif_co2 = this.dif_co2 * this.dif_co2_factor;
    let _dif_n2 = this.dif_n2 * this.dif_n22_factor;
    let _dif_other = this.dif_other * this.dif_other_factor;

    // diffuse the gases, where diffusion is partial pressure-driven
    let do2 = (this._comp_gas1.po2 - this._comp_gas2.po2) * _dif_o2 * this._t;
    // update the concentrations
    this._comp_gas1.co2 = (this._comp_gas1.co2 * this._comp_gas1.vol - do2) / this._comp_gas1.vol;
    this._comp_gas2.co2 = (this._comp_gas2.co2 * this._comp_gas2.vol + do2) / this._comp_gas2.vol;

    let dco2 = (this._comp_gas1.pco2 - this._comp_gas2.pco2) * _dif_co2 * this._t;
    // update the concentrations
    this._comp_gas1.cco2 = (this._comp_gas1.cco2 * this._comp_gas1.vol - dco2) / this._comp_gas1.vol;
    this._comp_gas2.cco2 = (this._comp_gas2.cco2 * this._comp_gas2.vol + dco2) / this._comp_gas2.vol;

    let dn2 = (this._comp_gas1.pn2 - this._comp_gas2.pn2) * _dif_n2 * this._t;
    // update the concentrations
    this._comp_gas1.cn2 = (this._comp_gas1.cn2 * this._comp_gas1.vol - dn2) / this._comp_gas1.vol;
    this._comp_gas2.cn2 = (this._comp_gas2.cn2 * this._comp_gas2.vol + dn2) / this._comp_gas2.vol;

    let dother = (this._comp_gas1.pother - this._comp_gas2.pother) * _dif_other * this._t;
    // update the concentrations
    this._comp_gas1.cother = (this._comp_gas1.cother * this._comp_gas1.vol - dother) / this._comp_gas1.vol;
    this._comp_gas2.cother = (this._comp_gas2.cother * this._comp_gas2.vol + dother) / this._comp_gas2.vol;

  }
}
