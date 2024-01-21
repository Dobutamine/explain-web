export class BloodResistor {
  static class_type = "BloodResistor";
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  no_flow = false;
  no_back_flow = true;
  comp_from = "";
  comp_to = "";
  r_for = 1000.0;
  r_for_factor = 1.0;
  r_back = 1000.0;
  r_back_factor = 1.0;
  r_k = 0.0;
  r_k_factor = 1.0;

  r_mob_factor = 1.0;
  r_ans_factor = 1.0;
  r_drug_factor = 1.0;
  r_scaling_factor = 1.0;

  // dependent parameters
  flow = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _model_comp_from = {};
  _model_comp_to = {};

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get a reference to the connected components
    this._model_comp_from = this._model_engine.models[this.comp_from];
    this._model_comp_to = this._model_engine.models[this.comp_to];

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // get the pressures of the connected model components
    _p1 = self._model_comp_from.pres;
    _p2 = self._model_comp_to.pres;

    // calculate the resistances
    _r_for_base = this.r_for * this.r_scaling_factor;
    r_for =
      _r_for_base +
      (this.r_for_factor * _r_for_base - _r_for_base) +
      (this.r_ans_factor * _r_for_base - _r_for_base) *
        this.ans_activity_factor +
      (this.r_mob_factor * _r_for_base - _r_for_base) +
      (this.r_drug_factor * _r_for_base - _r_for_base) +
      this.r_k *
        this.r_k_factor *
        this.r_scaling_factor *
        this.flow *
        this.flow;

    _r_back_base = this.r_back * this.r_scaling_factor;
    r_back =
      _r_back_base +
      (this.r_back_factor * _r_back_base - _r_back_base) +
      (this.r_ans_factor * _r_back_base - _r_back_base) *
        this.ans_activity_factor +
      (this.r_mob_factor * _r_back_base - _r_back_base) +
      (this.r_drug_factor * _r_back_base - _r_back_base) +
      this.r_k *
        this.r_k_factor *
        this.r_scaling_factor *
        this.flow *
        this.flow;

    // check if the resistances are not too small for the current stepsize
    if (r_for < 20.0) {
      r_for = 20.0;
    }

    if (r_back < 20.0) {
      r_back = 20.0;
    }

    // calculate the flow
    if (this.no_flow || (_p1 <= _p2 && this.no_back_flow)) {
      this.flow = 0.0;
    } else if (_p1 > _p2) {
      // forward flow
      this.flow = (_p1 - _p2) / r_for;
    } else {
      // back flow
      this.flow = (_p1 - _p2) / r_back;
    }

    // now update the volumes of the model components which are connected by this resistor
    if (this.flow > 0) {
      // flow is from comp_from to comp_to
      vol_not_removed = this._model_comp_from.volume_out(this.flow * this._t);
      // if not all volume can be removed from the model component then transfer the remaining volume to the other model component
      // this is undesirable but it is better than having a negative volume
      this._model_comp_to.volume_in(
        this.flow * this._t - vol_not_removed,
        this._model_comp_from
      );
      return;
    }

    if (this.flow < 0) {
      // flow is from comp_to to comp_from
      vol_not_removed = this._model_comp_to.volume_out(-this.flow * this._t);

      // if not all volume can be removed from the model component then transfer the remaining volume to the other model component
      // this is undesirable but it is better than having a negative volume
      this._model_comp_from.volume_in(
        -this.flow * this._t - vol_not_removed,
        this._model_comp_to
      );
      return;
    }
  }
}
