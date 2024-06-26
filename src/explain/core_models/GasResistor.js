export class GasResistor {
  static model_type = "GasResistor";
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
      target: "diffusion_enabled",
      caption: "diffusion allowed",
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
      target: "dif_o2",
      caption: "o2 diffusion coefficient",
      type: "number",
      optional: false,
      relative: false,
      factor: 1,
      delta: 0.001,
      rounding: 3,
      ul: 100000000000000.0,
      ll: 0.0,
    },
    {
      target: "dif_co2",
      caption: "co2 diffusion coefficient ",
      type: "number",
      optional: false,
      relative: false,
      factor: 1,
      delta: 0.001,
      rounding: 3,
      ul: 100000000000000.0,
      ll: 0.0,
    },
    {
      target: "reconnect",
      caption: "reconnect resistor",
      type: "function",
      optional: false,
      args: [
        {
          target: "comp_from",
          type: "list",
          options: ["GasCapacitance"],
        },
        {
          target: "comp_to",
          type: "list",
          options: ["GasCapacitance"],
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

  diffusion_enabled = true;
  dif_o2 = 0.001;
  dif_o2_factor = 1.0;
  dif_o2_scaling_factor = 1.0;
  dif_co2 = 0.001;
  dif_co2_factor = 1.0;
  dif_co2_scaling_factor = 1.0;

  // dependent parameters
  flow = 0.0;
  flow_lmin = 0.0;
  flow_forward_lmin = 0.0;
  flow_backward_lmin = 0.0;
  flux_o2 = 0.0;
  flux_co2 = 0.0;

  p1 = 0.0;
  p2 = 0.0;
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
  _analytics_timer = 0.0;
  _analytics_window = 10.0;

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

    if (typeof this.comp_from == "string") {
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
    let _p1 = this._model_comp_from.pres;
    let _p2 = this._model_comp_to.pres;

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

    // calculate the diffusion only when the two have birectional connection
    if (!this.no_flow && !this.no_back_flow && this.diffusion_enabled) {
      this.diffusion(_r_for, _r_back);
    }

    // analyze the data
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

  diffusion(_r_for, _r_back) {
    // we need to po2 and pco2 so we need to calculate the blood composition
    // get the partial pressures and gas concentrations from the components

    let co2_comp_blood1 = this._model_comp_from.co2;
    let cco2_comp_blood1 = this._model_comp_from.cco2;

    let co2_comp_blood2 = this._model_comp_to.co2;
    let cco2_comp_blood2 = this._model_comp_to.cco2;

    // calculate the O2 and CO2 flux
    this.flux_o2 =
      (co2_comp_blood1 - co2_comp_blood2) *
      this.dif_o2 *
      this.dif_o2_factor *
      this.dif_o2_scaling_factor *
      this._t;
    this.flux_co2 =
      (cco2_comp_blood1 - cco2_comp_blood2) *
      this.dif_co2 *
      this.dif_co2_factor *
      this.dif_co2_scaling_factor *
      this._t;

    // incorporate the resistances which are a surrogate of the contact area, so high resistance is less diffusion
    if (this.flow >= 0.0) {
      this.flux_o2 = this.flux_o2 / _r_for;
      this.flux_co2 = this.flux_co2 / _r_for;
    } else {
      this.flux_o2 = this.flux_o2 / _r_back;
      this.flux_co2 = this.flux_co2 / _r_back;
    }

    // calculate the new O2 and CO2 concentrations
    let new_co2_comp_blood1 =
      (co2_comp_blood1 * this._model_comp_from.vol - this.flux_o2) /
      this._model_comp_from.vol;
    if (new_co2_comp_blood1 < 0) {
      new_co2_comp_blood1 = 0;
    }

    let new_co2_comp_blood2 =
      (co2_comp_blood2 * this._model_comp_to.vol + this.flux_o2) /
      this._model_comp_to.vol;
    if (new_co2_comp_blood2 < 0) {
      new_co2_comp_blood2 = 0;
    }

    let new_cco2_comp_blood1 =
      (cco2_comp_blood1 * this._model_comp_from.vol - this.flux_co2) /
      this._model_comp_from.vol;
    if (new_cco2_comp_blood1 < 0) {
      new_cco2_comp_blood1 = 0;
    }

    let new_cco2_comp_blood2 =
      (cco2_comp_blood2 * this._model_comp_to.vol + this.flux_co2) /
      this._model_comp_to.vol;
    if (new_cco2_comp_blood2 < 0) {
      new_cco2_comp_blood2 = 0;
    }

    // set the new concentrations
    this._model_comp_from.co2 = new_co2_comp_blood1;
    this._model_comp_from.cco2 = new_cco2_comp_blood1;

    this._model_comp_to.co2 = new_co2_comp_blood2;
    this._model_comp_to.cco2 = new_cco2_comp_blood2;
  }

  analyze() {
    this._flow_counter += this._t;
    this._analytics_timer += this._t;
    if (
      this._heart.ncc_ventricular === 1 &&
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
    }
  }
}
