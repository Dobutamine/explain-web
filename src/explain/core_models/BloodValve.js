export class BloodValve {
  static model_type = "BloodValve";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "no_flow",
      caption: "no flow allowed",
      type: "boolean",
      optional: false,
    },
    {
      target: "no_back_flow",
      caption: "no back flow allowed",
      type: "boolean",
      optional: false,
    },
    {
      target: "r_for",
      caption: "forward flow resistance (mmHg*sec/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 10.0,
    },
    {
      target: "r_back",
      caption: "forward flow resistance (mmHg*sec/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 10.0,
    },
    {
      target: "r_k",
      caption: "non-linear resistance (sec/l)",
      type: "number",
      optional: false,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "reconnect",
      caption: "reconnect resistor",
      type: "function",
      optional: true,
      args: [
        {
          target: "comp_from",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
        },
        {
          target: "comp_to",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
        },
      ],
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  scalable = true;
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

  act_factor = 0.0;
  ans_activity_factor = 0.0;

  // dependent parameters
  flow = 0.0;
  flow_lmin = 0.0;
  flow_lmin_avg = 0.0;
  flow_forward_lmin = 0.0;
  flow_backward_lmin = 0.0;

  p1 = 0.0;
  p2 = 0.0;
  p1_ext = 0.0;
  p2_ext = 0.0;
  p1_ext_factor = 1.0;
  p2_ext_factor = 1.0;
  // local parameters
  _model_engine = {};
  _heart = {};
  _is_initialized = false;
  _t = 0.0005;
  _model_comp_from = {};
  _model_comp_to = {};
  _cum_forward_flow = 0.0;
  _cum_backward_flow = 0.0;
  _flow_counter = 0.0;
  _flow_mov_avg_counter = 0.0;
  _alpha = 0.05;
  _analytics_timer = 0.0;
  _analytics_window = 2.0;

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
    if (typeof this.comp_from == "string") {
      this._model_comp_from = this._model_engine.models[this.comp_from];
    } else {
      this._model_comp_from = this.comp_from;
    }

    if (typeof this.comp_to == "string") {
      this._model_comp_to = this._model_engine.models[this.comp_to];
    } else {
      this._model_comp_to = this.comp_to;
    }

    // reference to the heart
    this._heart = this._model_engine.models["Heart"];

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  reconnect(comp_from, comp_to) {
    // store the references
    this.comp_from = comp_from;
    this.comp_to = comp_to;

    // get a reference to the connected components
    if (typeof this.comp_from == "string") {
      this._model_comp_from = this._model_engine.models[this.comp_from];
    } else {
      this._model_comp_from = this.comp_from;
    }

    if (typeof this.comp_to == "string") {
      this._model_comp_to = this._model_engine.models[this.comp_to];
    } else {
      this._model_comp_to = this.comp_to;
    }
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // get the pressures of the connected model components
    let _p1 = this._model_comp_from.pres + this.p1_ext * this.p1_ext_factor;
    let _p2 = this._model_comp_to.pres + this.p2_ext * this.p2_ext_factor;

    // reset the external pressures
    this.p1_ext = 0;
    this.p2_ext = 0;

    // calculate the resistances
    let _r_for_base = this.r_for * this.r_scaling_factor;
    let _r_for =
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

    let _r_back_base = this.r_back * this.r_scaling_factor;
    let _r_back =
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
    if (_r_for < 20.0) {
      _r_for = 20.0;
    }

    if (_r_back < 20.0) {
      _r_back = 20.0;
    }

    this.p1 = this.ans_activity_factor;

    // calculate the flow
    if (this.no_flow || (_p1 <= _p2 && this.no_back_flow)) {
      this.flow = 0.0;
    } else if (_p1 > _p2) {
      // forward flow
      this.flow = (_p1 - _p2) / _r_for;
      this._cum_forward_flow += this.flow * this._t;
    } else {
      // back flow
      this.flow = (_p1 - _p2) / _r_back;
      this._cum_backward_flow += this.flow * this._t;
    }

    this.analyze();

    let vol_not_removed = 0.0;
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

  analyze() {
    this._flow_counter += this._t;
    this._analytics_timer += this._t;

    if (
      this._heart.ncc_ventricular === 1 ||
      this._analytics_timer > this._analytics_window
    ) {
      this._analytics_timer = 0.0;
      this.flow_forward_lmin =
        (this._cum_forward_flow / this._flow_counter) * 60.0;
      this.flow_backward_lmin =
        (this._cum_backward_flow / this._flow_counter) * 60.0;
      this.flow_lmin = this.flow_forward_lmin + this.flow_backward_lmin;
      this._cum_forward_flow = 0.0;
      this._cum_backward_flow = 0.0;
      this._flow_counter = 0.0;

      this._flow_mov_avg_counter += 1;
      if (this._flow_mov_avg_counter > 5) {
        this._flow_mov_avg_counter = 5;
        this.flow_lmin_avg =
          this._alpha * this.flow_lmin + (1 - this._alpha) * this.flow_lmin_avg;
      }
    }
  }
}
