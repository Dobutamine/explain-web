export class Lymph {
  static model_type = "Lymph";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  ducts = ["LD"];
  trunks = ["LT"];
  interstitium = ["IS"];
  pump = [];
  starlings = [
    "INT_IS",
    "KID_IS",
    "RLB_IS",
    "LS_IS",
    "RUB_IS",
    "LL_IS",
    "RL_IS",
  ];
  ISlungs = [
    "LL_IS",
    "RL_IS"
  ]

  feedback_enabled = false;
  min_mflow = 0.0;
  set_mflow = 0.1369;
  max_mflow = 0.2738;

  init_flow = 0.0000075

  tc_me_mflow = 3.0;
  g_me_mflow_low = -986121;
  g_me_mflow_high = -328707
  g_me_mflow = 0.0;
  d_me_mflow = 0.0;

  min_mpres = 7.65;
  set_mpres = 9.65;
  max_mpres = 11.65;

  tc_me_mpres = 3.0;
  g_me_mpres_low = 22500;
  g_me_mpres_high = 67500;
  g_me_mpres = 0.0;
  d_me_mpres = 0.0;

  // min_ISpres = -4.5;
  // set_ISpres = -3.5;
  // max_ISpres = -2.5;

  // tc_me_ISpres = 3.0;
  // g_me_ISpres = 111500;

  me = 0.0;
  me_ref = 45000;
  
  amp_freq_ratio = 450;

  // dependent parameters
  is_flow = 0.0;
  is_il_flow = 0.0;
  il_lt_flow = 0.0;
  lt_ld_flow = 0.0;
  ld_svc_flow = 0.0;
  isl_flow = 0.0;

  is_flowmlkgmin = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _analysis_counter = 0.0;
  _analysis_interval = 2.0;
  _cum_is_flow = 0.0;
  _cum_is_il_flow = 0.0;
  _cum_il_lt_flow = 0.0;
  _cum_lt_ld_flow = 0.0;
  _cum_ld_svc_flow = 0.0;
  _cum_isl_flow = 0.0;

  _update_window = 0.015;
  _update_counter = 0.0;

  _flows = [];
  _pres = [];
  _data_window_flow = 2400
  _data_window_pres = 2400

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

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // set the aboxy and solutes
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "LymphCapacitance") {
        if (Object.keys(model.aboxy).length < 1) {
          model.aboxy = { ...this.aboxy };
          model.solutes = { ...this.solutes };
        }
      }
    }

    // fill the list of flows with the baroreflex start point
    this._flows = new Array(this._data_window_flow).fill(this.init_flow);
    this._pres = new Array(this._data_window_pres).fill(this.set_mpres);
    // this._setflow = new Array(this._data_window).fill(this.init_flow);

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  switch_lymphatics(state) {
    this.interstitium.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.trunks.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.ducts.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.pump.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.starlings.forEach((i) => {
      this._model_engine.models[i].is_enabled = state;
    });
    this.is_enabled = state;

    //this._model_engine.rebuildExecutionList = true;
    console.log(this._model_engine);
  }

  switch_feedback(state) {
    this.feedback_enabled = state;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this._analysis_counter > this._analysis_interval) {
      this.isl_flow = (this._cum_isl_flow / this._analysis_counter) * 60.0;
      this.is_flow = (this._cum_is_flow / this._analysis_counter) * 60.0;
      this.is_flowmlkgmin = this.is_flow *1000 / this._model_engine.weight
      this.is_il_flow = (this._cum_is_il_flow / this._analysis_counter) * 60.0;
      this.il_lt_flow = (this._cum_il_lt_flow / this._analysis_counter) * 60.0;
      this.lt_ld_flow = (this._cum_lt_ld_flow / this._analysis_counter) * 60.0;
      this.ld_svc_flow =
        (this._cum_ld_svc_flow / this._analysis_counter) * 60.0;
      

      this._cum_is_flow = 0.0;
      this._cum_is_il_flow = 0.0;
      this._cum_il_lt_flow = 0.0;
      this._cum_lt_ld_flow = 0.0;
      this._cum_ld_svc_flow = 0.0;
      this._cum_isl_flow = 0.0;

      this._analysis_counter = 0.0;
    }

    this.starlings.forEach((cap) => {
      this._cum_is_flow += this._model_engine.models[cap].flow * this._t;
    });
    this.ISlungs.forEach((pv) => {
      this._cum_isl_flow += this._model_engine.models[pv].flow * this._t;
    });
    this._cum_is_il_flow += this._model_engine.models["IS_IL"].flow * this._t;
    this._cum_il_lt_flow += this._model_engine.models["IL_LT"].flow * this._t;
    this._cum_lt_ld_flow += this._model_engine.models["LT_LD"].flow * this._t;
    this._cum_ld_svc_flow += this._model_engine.models["LD_SVC"].flow * this._t;

    this._analysis_counter += this._t;
  
    // the ans model is executed at a lower frequency than the model step for performance reasons
    if (this._update_counter > this._update_window) {
      // insert a new flow at the start of the list
      this._flows.unshift(this._model_engine.models["LD_SVC"].flow);
      this._pres.unshift(this._model_engine.models["LD"].pres_tm);
      // remove the last flow from the list
      this._flows.pop();
      this._pres.pop();

      // get the moving average of the flow
      this.mflow =
        this._flows.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ) / this._data_window_flow*60000/this._model_engine.weight;  

      this.mpres =
        this._pres.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0
        ) / this._data_window_pres

      // this._isflow = 0.0;
      // this.starlings.forEach((cap) => {
      //   this._isflow += this._model_engine.models[cap].flow;
      // });
      // this._setflow.unshift(this._isflow);

      // this._setflow.pop();      

      // this.msetflow = 
      //   this._setflow.reduce(
      //     (accumulator, currentValue) => accumulator + currentValue,
      //     0
      //   ) / this._data_window*60000/this._model_engine.weight;  

      let a_mflow = this.activation_function(this.mflow, this.max_mflow, this.set_mflow, this.min_mflow)
      this.d_me_mflow = this.time_constant(this.tc_me_mflow, this.d_me_mflow, a_mflow, this._update_window)
      if (a_mflow >= 0.0) {
        this.g_me_mflow = this.g_me_mflow_high;
      } else {
        this.g_me_mflow = this.g_me_mflow_low;
      }

      let a_mpres = this.activation_function(this.mpres, this.max_mpres, this.set_mpres, this.min_mpres)
      this.d_me_mpres = this.time_constant(this.tc_me_mpres, this.d_me_mpres, a_mpres, this._update_window)
      if (a_mpres >= 0.0) {
        this.g_me_mpres = this.g_me_mpres_high;
      } else {
        this.g_me_mpres = this.g_me_mpres_low;
      }

      this.me = this.me_ref + 0.5*(this.d_me_mpres * this.g_me_mpres) + 0.5*(this.d_me_mflow * this.g_me_mflow) 
      if (this.me <= 0.0) {
        this.me = 0.001;
      }

      //reset update counter
      this.amp_freq_controller();

      if (this.feedback_enabled) {
        this._model_engine.models["LT"].ampINT = this.amp;
        this._model_engine.models["LD"].ampINT = this.amp;
        this._model_engine.models["LT"].freqINT = this.freq;
        this._model_engine.models["LD"].freqINT = this.freq;
      }  
      this._update_counter = 0.0;
    }

    this._update_counter += this._t;
  }

  amp_freq_controller() {
    // calculate the spontaneous resp rate depending on the target minute volume (from ANS) and the set vt-rr ratio
    this.freq = Math.sqrt(
      this.me / (this.amp_freq_ratio)
    );

    // calculate the target tidal volume depending on the target resp rate and target minute volume (from ANS)
    if (this.freq > 0) {
      this.amp = this.me / this.freq;
    }
  }

  time_constant(tc, cv, nv, t = 0.015) {
    return t * ((1.0 / tc) * (-cv + nv)) + cv;
  }
 
  activation_function(value, max, setpoint, min) {
    let activation = 0.0;

    if (value >= max) {
      activation = max - setpoint;
    } else {
      if (value <= min) {
        activation = min - setpoint;
      } else {
        activation = value - setpoint;
      }
    }

    return activation;
  }
}
