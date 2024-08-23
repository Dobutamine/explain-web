export class Resuscitation {
  static model_type = "Resuscitation";
  static model_interface = [];

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.ventilator = [];
    this.breathing = [];
    this.compressions = 15.0;
    this.chest_comp_enabled = true;
    this.chest_comp_freq = 100.0;
    this.chest_comp_pres = 10.0;
    this.chest_comp_time = 1.0;
    this.chest_comp_targets = { THORAX: 0.1 };
    this.chest_comp_cont = false;

    this.ventilations = 2.0;
    this.vent_freq = 30.0;
    this.vent_pres_pip = 16.0;
    this.vent_pres_peep = 5.0;
    this.vent_insp_time = 1.0;
    this.vent_fio2 = 0.21;
    this.async_ventilation = false;
    this.forced_hr = false;

    // Dependent properties
    this.chest_comp_force = 0.0;
    this.overriden_hr = 30.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._comp_timer = 0.0;
    this._comp_counter = 0.0;
    this._comp_pause = false;
    this._comp_pause_timer = 0.0;
    this._vent_timer = 0.0;
    this._analytics_timer = 0.0;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });
    // Flag that the model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // y(t) = A sin(2PIft+o)
    const heartModel = this._model_engine.models["Heart"];
    heartModel.heart_rate_override = this.forced_hr;

    if (this.forced_hr) {
      heartModel.heart_rate_forced = parseFloat(this.overriden_hr);
    }

    if (this.cpr_enabled) {
      const f = this.chest_comp_freq / 60.0;
      const a = this.chest_comp_pres / 2.0;

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
        heartModel.ncc_resus += 1.0;
      }

      if (this._comp_timer > 60.0 / this.chest_comp_freq) {
        this._comp_timer = 0.0;
        this._comp_counter += 1;
        heartModel.ncc_resus = 0.0;
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

      if (this._comp_pause_timer > this.ventilations * this.vent_insp_time * 2.0) {
        this._comp_pause = false;
        this._vent_timer = 0.0;
      }

      for (const [key, value] of Object.entries(this.chest_comp_targets)) {
        this._model_engine.models[key].pres_cc = parseFloat(
          this.chest_comp_force * value
        );
      }
    }
  }

  switch_cpr(state) {
    const ventilator = this._model_engine.models["Ventilator"];
    const breathing = this._model_engine.models["Breathing"];
    if (state) {
      ventilator.set_ventilator_pc(
        this.vent_pres_pip,
        this.vent_pres_peep,
        this.vent_freq,
        this.vent_insp_time,
        10.0
      );
      ventilator.switch_ventilator(true);
      ventilator.vent_sync = false;
      breathing.switch_breathing(false);
      this.cpr_enabled = true;
    } else {
      this.cpr_enabled = false;
      ventilator.set_ventilator_pc(16.0, 5.0, 50, 0.4, 10.0);
    }
    ventilator.vent_sync = true;
  }
}
