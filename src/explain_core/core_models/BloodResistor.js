export class BloodResistor {
  // static properties
  static model_type = "BloodResistor";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
    },
    {
      target: "no_flow",
      caption: "no flow allowed",
      type: "boolean",
    },
    {
      target: "no_back_flow",
      caption: "no back flow allowed",
      type: "boolean",
    },
    {
      target: "r_for",
      caption: "forward flow resistance (mmHg*sec/l)",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 10.0,
    },
    {
      target: "r_back",
      caption: "backward flow resistance (mmHg*sec/l)",
      type: "number",
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
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "comp_from",
      caption: "model from ",
      type: "list",
      options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
    },
    {
      target: "comp_to",
      caption: "model to ",
      type: "list",
      options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
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

  constructor(model_ref, name = "") {
    // initialize independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.no_flow = true;
    this.no_back_flow = true;
    this.comp_from = "";
    this.comp_to = "";
    this.r_for = this.r_for_factor = 1.0;
    this.r_back = this.r_back_factor = 1.0;
    this.r_k = this.r_k_factor = 1.0;
    this.r_ans_factor = this.r_mob_factor = this.r_drug_factor = 1.0;
    this.r_scaling_factor = 1.0;
    this.ans_activity_factor = this.act_factor = 0.0;
    this.p1_ext = this.p2_ext = 0.0;
    this.p1_ext_factor = this.p2_ext_factor = 0.0;
    this.analysis_enabled = false;

    // initialize dependent properties
    this.flow = 0.0;
    this.flow_lmin = 0.0;
    this.flow_lmin_avg = 0.0;
    this.flow_lmin_forward = 0.0;
    this.flow_lmin_backward = 0.0;

    // local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._heart = null;
    this._model_comp_from = null;
    this._model_comp_to = null;
    this._temp_flow_forward = 0.0;
    this._temp_flow_backward = 0.0;
    this._flow_avg_queue = [];
    this._flow_avg_sum = 0.0;
    this._flow_avg_no_heartbeats = 10;
    this._analysis_counter = 0.0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get a reference to the connected components
    if (typeof this.comp_from === "string") {
      this._model_comp_from = this._model_engine.models[this.comp_from];
    } else {
      this._model_comp_from = this.comp_from;
    }

    if (typeof this.comp_to === "string") {
      this._model_comp_to = this._model_engine.models[this.comp_to];
    } else {
      this._model_comp_to = this.comp_to;
    }

    // flag that the model is initialized
    this._is_initialized = true;
  }

  // this method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // actual model calculations are done here
  calc_model() {
    // get the pressures of the connected model components
    const _p1 = this._model_comp_from.pres + this.p1_ext * this.p1_ext_factor;
    const _p2 = this._model_comp_to.pres + this.p2_ext * this.p2_ext_factor;

    // reset the external pressures
    this.p1_ext = 0;
    this.p2_ext = 0;

    // calculate the resistances
    const _r_for_base = this.r_for * this.r_scaling_factor;
    const _r_back_base = this.r_back * this.r_scaling_factor;
    const _r_k_base = this.r_k * this.r_scaling_factor;

    let _r_for =
      _r_for_base +
      (this.r_for_factor - 1) * _r_for_base +
      (this.r_ans_factor - 1) * _r_for_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_for_base +
      (this.r_drug_factor - 1) * _r_for_base;

    let _r_back =
      _r_back_base +
      (this.r_back_factor - 1) * _r_back_base +
      (this.r_ans_factor - 1) * _r_back_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_back_base +
      (this.r_drug_factor - 1) * _r_back_base;

    let _r_k =
      _r_k_base +
      (this.r_k_factor - 1) * _r_k_base +
      (this.r_ans_factor - 1) * _r_k_base * this.ans_activity_factor +
      (this.r_mob_factor - 1) * _r_k_base +
      (this.r_drug_factor - 1) * _r_k_base;

    // make the resistances flow dependent
    _r_for += _r_k * this.flow * this.flow;
    _r_back += _r_k * this.flow * this.flow;

    // guard for too small resistances
    _r_for = Math.max(_r_for, 20.0);
    _r_back = Math.max(_r_back, 20.0);

    // calculate flow
    if (this.no_flow || (_p1 <= _p2 && this.no_back_flow)) {
      this.flow = 0.0;
    } else if (_p1 > _p2) {
      // forward flow
      this.flow = (_p1 - _p2) / _r_for;
    } else {
      // back flow
      this.flow = (_p1 - _p2) / _r_back;
    }

    // Update the volumes of the model components connected by this resistor
    let vol_not_removed = 0.0;
    if (this.flow > 0) {
      // Flow is from comp_from to comp_to
      vol_not_removed = this._model_comp_from.volume_out(this.flow * this._t);
      this._model_comp_to.volume_in(
        this.flow * this._t - vol_not_removed,
        this._model_comp_from
      );
    } else if (this.flow < 0) {
      // Flow is from comp_to to comp_from
      vol_not_removed = this._model_comp_to.volume_out(-this.flow * this._t);
      this._model_comp_from.volume_in(
        -this.flow * this._t - vol_not_removed,
        this._model_comp_to
      );
    }

    // do the anaylis if enabled
    if (this.analysis_enabled) {
      this.analyze();
    } else {
      this.flow_lmin = 0.0;
      this.flow_lmin_forward = 0.0;
      this.flow_lmin_backward = 0.0;
    }
  }

  reconnect(comp_from, comp_to) {
    // store the connectors
    this.comp_from = comp_from;
    this.comp_to = comp_to;

    // get a reference to the connected components
    if (typeof this.comp_from === "string") {
      this._model_comp_from = this._model_engine.models[this.comp_from];
    } else {
      this._model_comp_from = this.comp_from;
    }

    if (typeof this.comp_to === "string") {
      this._model_comp_to = this._model_engine.models[this.comp_to];
    } else {
      this._model_comp_to = this.comp_to;
    }
  }

  analyze() {
    if (this.flow > 0.0) {
      this._temp_flow_forward += this.flow * this._t;
    } else {
      this._temp_flow_backward += this.flow * this._t;
    }
    this._analysis_counter += this._t;

    if (this._model_engine.ncc_ventricular == 1) {
      this.flow_lmin =
        ((this._temp_flow_forward + this._temp_flow_backward) /
          this._analysis_counter) *
        60.0;
      this.flow_lmin_forward =
        (this._temp_flow_forward / this._analysis_counter) * 60.0;
      this.flow_lmin_backward =
        (this._temp_flow_backward / this._analysis_counter) * 60.0;

      this._temp_flow_forward = 0.0;
      this._temp_flow_backward = 0.0;
      this._analysis_counter = 0.0;

      // calculate a moving average over a number of heartbeats
      this._flow_avg_queue.push(this.flow_lmin);
      this._flow_avg_sum += this.flow_lmin;
      if (this._flow_avg_queue.length > this._flow_avg_no_heartbeats) {
        this._flow_avg_sum -= this._flow_avg_queue.shift();
      }
      this.flow_lmin_avg = this._flow_avg_sum / this._flow_avg_queue.length;
    }
  }
}
