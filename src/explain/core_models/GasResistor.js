import { BaseModelClass } from "./BaseModelClass";

export class GasResistor extends BaseModelClass {
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.r_for = 1.0; // forward flow resistance Rf (mmHg/l*s)
    this.r_back = 1.0; // backward flow resistance Rb (mmHg/l*s)
    this.r_k = 0.0; // non-linear resistance factor K1 (unitless)
    this.comp_from = ""; // name of the upstream component
    this.comp_to = ""; // name of the downstream component
    this.no_flow = false; // flag whether flow is allowed across this resistor
    this.no_back_flow = false; // flag whether backflow is allowed across this resistor

    // general factors
    this.ans_activity_factor = 1.0;
    this.r_factor = 1.0;
    this.r_scaling_factor = 1.0;
    this.r_ans_factor = 1.0;
    this.r_drug_factor = 1.0;
    this.r_k_factor = 1.0;
    this.r_k_scaling_factor = 1.0;
    this.r_k_ans_factor = 1.0;
    this.r_k_drug_factor = 1.0;

    // dependent properties
    this.flow = 0.0; // flow f(t) (L/s)

    // local variables
    this._comp_from = {}; // reference to the upstream component
    this._comp_to = {}; // reference to the downstream component
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // find the up- and downstream components and store the references
    this._comp_from = this._model_engine.models[this.comp_from];
    this._comp_to = this._model_engine.models[this.comp_to];

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // get the pressure of the volume-containing compartments and incorporate the external pressures
    let _p1_t = this._comp_from.pres;
    let _p2_t = this._comp_to.pres;

    // incorporate scaling factors
    let _r_for_base = this.r_for * this.r_scaling_factor;
    let _r_back_base = this.r_back * this.r_scaling_factor;
    let _r_k_base = this.r_k * this.r_scaling_factor;

    // incorporate all factors influencing this resistor
    let _r_for =
      _r_for_base +
      (this.r_factor - 1) * _r_for_base +
      (this.r_ans_factor - 1) * _r_for_base * this.ans_activity_factor +
      (this.r_drug_factor - 1) * _r_for_base;

    let _r_back =
      _r_back_base +
      (this.r_factor - 1) * _r_back_base +
      (this.r_ans_factor - 1) * _r_back_base * this.ans_activity_factor +
      (this.r_drug_factor - 1) * _r_back_base;

    let _r_k =
      _r_k_base +
      (this.r_k_factor - 1) * _r_k_base +
      (this.r_k_ans_factor - 1) * _r_k_base * this.ans_activity_factor +
      (this.r_k_drug_factor - 1) * _r_k_base;

    // make the resistances flow dependent
    _r_for += _r_k * this.flow * this.flow;
    _r_back += _r_k * this.flow * this.flow;

    // reset the current flow as a new value is coming
    this.flow = 0.0;

    // return if no flow is allowed across this resistor
    if (this.no_flow) {
      return;
    }

    // calculate the forward flow between two volume-containing gas capacitances
    if (_p1_t >= _p2_t) {
      this.flow = (_p1_t - _p2_t - _r_k * Math.pow(this.flow, 2)) / _r_for;
      // update the volumes of the connected components
      let vol_not_removed = this._comp_from.volume_out(this.flow * this._t);
      this._comp_to.volume_in(
        this.flow * this._t - vol_not_removed,
        this._comp_from
      );
      return;
    }

    // calculate the backward flow between two volume-containing gas capacitances
    if (_p1_t < _p2_t && !this.no_back_flow) {
      this.flow = (_p1_t - _p2_t + _r_k * Math.pow(this.flow, 2)) / _r_back;
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
