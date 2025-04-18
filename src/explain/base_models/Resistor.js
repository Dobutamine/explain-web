import { BaseModelClass } from "./BaseModelClass";

export class Resistor extends BaseModelClass {
  // static properties
  static model_type = "Resistor";
  model_interface = [
    {
      caption: "no flow allowed",
      target: "no_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "no back flow allowed",
      target: "no_back_flow",
      type: "boolean",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance",
      target: "r_for",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "backward resistance",
      target: "r_back",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "non linear resistance factor",
      target: "r_k",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0
    },
    {
      caption: "forward resistance factor",
      target: "r_for_factor",
      type: "factor"
    },
    {
      caption: "backward resistance factor",
      target: "r_back_factor",
      type: "factor"
    },
    
  ]

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.r_for = 1.0; // forward flow resistance Rf (mmHg/l*s)
    this.r_back = 1.0; // backward flow resistance Rb (mmHg/l*s )
    this.r_k = 0.0; // non-linear resistance factor K1 (unitless)
    this.comp_from = ""; // holds the name of the upstream component
    this.comp_to = ""; // holds the name of the downstream component
    this.no_flow = false; // flags whether flow is allowed across this resistor
    this.no_back_flow = false; // flags whether backflow is allowed across this resistor
    this.p1_ext = 0.0; // external pressure on the inlet (mmHg)
    this.p2_ext = 0.0; // external pressure on the outlet (mmHg)

    // general factors
    this.r_factor = 1.0;
    this.r_k_factor = 1.0;

    // initialize dependent properties
    this.flow = 0.0; // flow f(t) (L/s)

    // local variables
    this._comp_from = {}; // holds a reference to the upstream component
    this._comp_to = {}; // holds a reference to the downstream component
    this._r_for = 1000; // forward resistance (mmHg/L*s)
    this._r_back = 1000; // backward resistance (mmHg/L*s)
    this._r_k = 0; // non-linear resistance factor (unitless)
  }


  calc_model() {
    // find the up- and downstream components and store the references
    this._comp_from = this._model_engine.models[this.comp_from];
    this._comp_to = this._model_engine.models[this.comp_to];

    // calculate the resistances
    this.calc_resistance();

    // calculate the flow
    this.calc_flow();
  }

  // calculate resistance
  calc_resistance() {
       // incorporate all factors influencing this resistor
       this._r_for = this.r_for + (this.r_factor - 1) * this.r_for
       this._r_back = this.r_back + (this.r_factor - 1) * this.r_back
       this._r_k = this.r_k + (this.r_k_factor - 1) * this.r_k
   
       // make the resistances flow dependent
       this._r_for += this._r_k * this.flow * this.flow;
       this._r_back += this._r_k * this.flow * this.flow;
  }

  calc_flow() {
    // get the pressure of the volume containing compartments and incorporate the external pressures
    let _p1_t = this._comp_from.pres + this.p1_ext;
    let _p2_t = this._comp_to.pres + this.p2_ext;

    // reset the external pressures
    this.p1_ext = 0.0;
    this.p2_ext = 0.0;

    // reset the current flow
    this.flow = 0.0;

    // return if no flow is allowed across this resistor
    if (this.no_flow) {
      return;
    }

    // calculate the forward flow between two components
    if (_p1_t >= _p2_t) {
      this.flow = (_p1_t - _p2_t - this._r_k * Math.pow(this.flow, 2)) / this._r_for;

      // update the volumes of the connected components
      let vol_not_removed = this._comp_from.volume_out(this.flow * this._t);
      this._comp_to.volume_in(
        this.flow * this._t - vol_not_removed,
        this._comp_from
      );
      return;
    }

    // calculate the backward flow between two components
    if (_p1_t < _p2_t && !this.no_back_flow) {
      this.flow = (_p1_t - _p2_t + this._r_k * Math.pow(this.flow, 2)) / this._r_back;

      // update the volumes of the connected components
      let vol_not_removed = this._comp_to.volume_out(-this.flow * this._t);
      this._comp_from.volume_in(
        -this.flow * this._t - vol_not_removed,
        this._comp_to
      );
      return;
    }
  }
}
