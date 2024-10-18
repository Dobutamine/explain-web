import { BaseModelClass } from "./BaseModelClass";

export class BloodResistor extends BaseModelClass {
  // static properties
  static model_type = "BloodResistor";
  static model_interface = [];

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
    this.ans_activity_factor = 1.0;
    this.r_factor = 1.0;
    this.r_scaling_factor = 1.0;
    this.r_mob_factor = 1.0;
    this.r_ans_factor = 1.0;
    this.r_drug_factor = 1.0;
    this.r_k_factor = 1.0;
    this.r_k_scaling_factor = 1.0;
    this.r_k_ans_factor = 1.0;
    this.r_k_drug_factor = 1.0;

    // initialize dependent properties
    this.flow = 0.0; // flow f(t) (L/s)

    // local variables
    this._comp_from = {}; // holds a reference to the upstream component
    this._comp_to = {}; // holds a reference to the downstream component
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
    // get the pressure of the volume containing compartments and incorporate the external pressures
    let _p1_t = this._comp_from.pres + this.p1_ext;
    let _p2_t = this._comp_to.pres + this.p2_ext;

    // reset the external pressures
    this.p1_ext = 0;
    this.p2_ext = 0;

    // incorporate the scaling factors
    let _r_for_base = this.r_for * this.r_scaling_factor;
    let _r_back_base = this.r_back * this.r_scaling_factor;
    let _r_k_base = this.r_k * this.r_scaling_factor;

    // incorporate all factors influencing this resistor
    let _r_for =
      _r_for_base +
      (this.r_factor - 1) * _r_for_base +
      (this.r_ans_factor - 1) * _r_for_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_for_base +
      (this.r_drug_factor - 1) * _r_for_base;

    let _r_back =
      _r_back_base +
      (this.r_factor - 1) * _r_back_base +
      (this.r_ans_factor - 1) * _r_back_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_back_base +
      (this.r_drug_factor - 1) * _r_back_base;

    let _r_k =
      _r_k_base +
      (this.r_k_factor - 1) * _r_k_base +
      (this.r_k_ans_factor - 1) * _r_k_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_k_base +
      (this.r_drug_factor - 1) * _r_k_base;

    // make the resistances flow dependent
    _r_for += _r_k * this.flow * this.flow;
    _r_back += _r_k * this.flow * this.flow;

    // reset the current flow
    this.flow = 0.0;

    // return if no flow is allowed across this resistor
    if (this.no_flow) {
      return;
    }

    // calculate the forward flow between two components
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

    // calculate the backward flow between two components
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
