export class Resuscitation {
  static model_type = "Resuscitation";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  compressions = 15.0;
  chest_comp_enabled = true;
  chest_comp_freq = 100.0;
  chest_comp_pres = 10.0;
  chest_comp_time = 1.0;
  chest_comp_targets = {
    THORAX: 0.1,
  };
  chest_comp_cont = false;

  ventilations = 2.0;
  vent_freq = 30.0;
  vent_pres_pip = 16.0;
  vent_pres_peep = 5.0;
  vent_insp_time = 1.0;
  vent_fio2 = 0.21;
  async_ventilation = false;
  forced_hr = false;

  // dependent parameters
  chest_comp_force = 0.0;
  overriden_hr = 30.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _comp_timer = 0.0;
  _comp_counter = 0.0;
  _comp_pause = false;
  _comp_pause_timer = 0.0;
  _vent_timer = 0.0;

  _analytics_timer = 0.0;

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  switch_cpr(state) {
    if (state) {
      this._model_engine.models["Ventilator"].set_ventilator_pc(
        this.vent_pres_pip,
        this.vent_pres_peep,
        this.vent_freq,
        this.vent_insp_time,
        10.0
      );
      this._model_engine.models["Ventilator"].switch_ventilator(true);
      this._model_engine.models["Ventilator"].vent_sync = false;
      this._model_engine.models["Breathing"].switch_breathing(false);
      this.cpr_enabled = true;
    } else {
      this.cpr_enabled = false;
      this._model_engine.models["Ventilator"].set_ventilator_pc(
        16.0,
        5.0,
        50,
        0.4,
        10.0
      );
      this._model_engine.models["Ventilator"].vent_sync = true;
      // for (let [comp_target, force] of Object.entries(
      //   this.chest_comp_targets
      // )) {
      //   this._model_engine.models[comp_target].pres_cc = 0.0;
      // }
    }
  }
  calc_model() {
    // y(t) = A sin(2PIft+o)
    // A = amplitude, f = frequency in Hz, t is time, o = phase shift

    this._model_engine.models["Heart"].heart_rate_override = this.forced_hr;
    if (this.forced_hr) {
      this._model_engine.models["Heart"].heart_rate_forced = parseFloat(
        this.overriden_hr
      );
    }
    if (this.cpr_enabled) {
      let f = this.chest_comp_freq / 60.0;
      let a = this.chest_comp_pres / 2.0;
      if (this.chest_comp_cont) {
        this._comp_pause = false;
        this._vent_timer += this._t;
        if (this._vent_timer > this.vent_insp_time * 2.1) {
          this._vent_timer = 0.0;
          this._model_engine.models["Ventilator"].trigger_breath();
        }
      }

      if (!this._comp_pause) {
        this.chest_comp_force =
          a * Math.sin(2 * Math.PI * f * this._comp_timer - 0.5 * Math.PI) + a;
        this._comp_timer += this._t;
        this._model_engine.models["Heart"].ncc_resus += 1.0;
      }

      if (this._comp_timer > 60.0 / this.chest_comp_freq) {
        this._comp_timer = 0.0;
        this._comp_counter += 1;
        this._model_engine.models["Heart"].ncc_resus = 0.0;
      }

      if (this._comp_counter == this.compressions && !this.chest_comp_cont) {
        this._model_engine.models["Ventilator"].trigger_breath();
        this._vent_timer = 0.0;
        this._comp_counter = 0;
        this._comp_pause_timer = 0.0;
        this._comp_pause = true;
      }

      if (this._comp_pause && !this.chest_comp_cont) {
        this._comp_pause_timer += this._t;
        this._vent_timer += this._t;
        if (this._vent_timer > this.vent_insp_time * 2.1) {
          this._vent_timer = 0.0;
          this._model_engine.models["Ventilator"].trigger_breath();
        }
      }

      if (
        this._comp_pause_timer >
        this.ventilations * this.vent_insp_time * 2.0
      ) {
        this._comp_pause = false;
        this._vent_timer = 0.0;
      }

      for (let [comp_target, force] of Object.entries(
        this.chest_comp_targets
      )) {
        this._model_engine.models[comp_target].pres_cc = parseFloat(
          this.chest_comp_force * force
        );
      }
    }
  }
}
