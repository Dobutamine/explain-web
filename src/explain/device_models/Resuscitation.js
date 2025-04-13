import { BaseModelClass } from "../base_models/BaseModelClass.js";

export class Resuscitation extends BaseModelClass {
  // static properties
  static model_type = "Resuscitation";
  static model_interface = [
    {
      caption: "switch cpr on/off",
      target: "switch_cpr",
      type: "function",
      args:[
        {
          caption: "state",
          target: "cpr_enabled",
          type: "boolean",
        },
      ]
    },
    {
      caption: "chest compressions frequency (/min)",
      target: "chest_comp_freq",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "chest compressions pressure (mmHg)",
      target: "chest_comp_max_pres",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "no of chest compressions (/cycle)",
      target: "chest_comp_no",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "continuous compressions",
      target: "chest_comp_cont",
      type: "boolean",
    },
    {
      caption: "ventilation frequency (/min)",
      target: "vent_freq",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "no of ventilation (/cycle)",
      target: "vent_no",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "ventilation peak pressure (cmH2O)",
      target: "vent_pres_pip",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "ventilation peep (cmH2O)",
      target: "vent_pres_peep",
      type: "number",
      delta: 1,
      factor: 1.0,
      rounding: 0,
    },
    {
      caption: "ventilation inspiration time (s)",
      target: "vent_insp_time",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
    {
      caption: "set cpr fio2",
      target: "set_fio2",
      type: "function",
      args:[
        {
          caption: "new fio2",
          target: "vent_fio2",
          type: "number",
          delta: 0.01,
          factor: 1.0,
          ul: 1.0,
          ll: 0.0,
          rounding: 2
        },
      ]
    },


  ];

  /*
    The Resuscitation class models a resuscitation situation where chest compressions and ventilations are
    performed at various different rates.
    */
  constructor(model_ref, name = "") {
    // initialize the base model class
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties
    this.cpr_enabled = false; // determines whether CPR is enabled or not
    this.chest_comp_freq = 100.0; // chest compressions frequency (compressions / min)
    this.chest_comp_max_pres = 10.0; // maximal pressure of the chest compressions (mmHg)
    this.chest_comp_targets = { THORAX: 0.1 }; // dictionary holding the target models of the chest compressions and the relative force
    this.chest_comp_no = 15; // number of compressions if not continuous
    this.chest_comp_cont = false; // determines whether the chest compressions are continuous

    this.vent_freq = 30.0; // ventilations frequency (breaths / min)
    this.vent_no = 2; // number of ventilations if not continuous
    this.vent_pres_pip = 16.0; // peak pressure of the ventilations (cmH2O)
    this.vent_pres_peep = 5.0; // positive end-expiratory pressure of the ventilations (cmH2O)
    this.vent_insp_time = 1.0; // inspiration time of the ventilations (s)
    this.vent_fio2 = 0.21; // fio2 of the inspired air

    // -----------------------------------------------
    // initialize dependent properties
    this.chest_comp_pres = 0.0; // compression pressure (mmHg)

    // -----------------------------------------------
    // local variables
    this._ventilator = null; // reference to the mechanical ventilator model
    this._breathing = null; // reference to the breathing model
    this._comp_timer = 0.0; // compressions timer (s)
    this._comp_counter = 0; // counter of the number of compressions
    this._comp_pause = false; // determines whether the compressions are paused or not
    this._comp_pause_interval = 2.0; // interval of the compressions pause (s)
    this._comp_pause_counter = 0.0; // compressions pause counter (s)
    this._vent_interval = 0.0; // interval between ventilations (s)
    this._vent_counter = 0.0; // ventilation interval counter (s)
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get references to the model on which this model depends
    this._ventilator = this._model_engine.models["Ventilator"];
    this._breathing = this._model_engine.models["Breathing"];

    // set the fio2 on the ventilator
    this.set_fio2(this.vent_fio2);

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // return if cpr is not enabled
    if (!this.cpr_enabled) return;

    // calculate the compression pause (no of ventilations * breath duration)
    this._comp_pause_interval = (60.0 / this.vent_freq) * this.vent_no;
    this._vent_interval = this._comp_pause_interval / this.vent_no + this._t;

    // if the compressions are continuous set the ventilator frequency on the ventilator model
    if (this.chest_comp_cont) {
      this._ventilator.vent_rate = this.vent_freq;
    } else {
      // if the compressions are not continuous, set an extremely low ventilator rate
      this._ventilator.vent_rate = 1.0;
    }

    // handle the pause in compressions
    if (this._comp_pause) {
      this._comp_pause_counter += this._t;

      if (this._comp_pause_counter > this._comp_pause_interval) {
        this._comp_pause = false;
        this._comp_pause_counter = 0.0;
        this._comp_counter = 0;
        this._vent_counter = 0.0;
      }

      this._vent_counter += this._t;

      if (this._vent_counter > this._vent_interval) {
        this._vent_counter = 0.0;
        this._ventilator.trigger_breath();
      }
    } else {
      // calculate the compression force using y(t) = A sin(2PIft+o)
      const a = this.chest_comp_max_pres / 2.0;
      const f = this.chest_comp_freq / 60.0;
      this.chest_comp_pres =
        a * Math.sin(2 * Math.PI * f * this._comp_timer - 0.5 * Math.PI) + a;

      this._comp_timer += this._t;

      if (this._comp_timer > 60.0 / this.chest_comp_freq) {
        this._comp_timer = 0.0;
        this._comp_counter += 1;
      }
    }

    // pause compressions if necessary
    if (this._comp_counter >= this.chest_comp_no && !this.chest_comp_cont) {
      this._comp_pause = true;
      this._comp_pause_counter = 0.0;
      this._comp_counter = 0;
      this._ventilator.trigger_breath();
    }

    // apply the compression force to the target
    for (const [key, value] of Object.entries(this.chest_comp_targets)) {
      this._model_engine.models[key].pres_cc = this.chest_comp_pres * value;
    }
  }

  switch_cpr(state) {
    if (state) {
      this._ventilator.switch_ventilator(true);
      this._ventilator.set_pc(
        this.vent_pres_pip,
        this.vent_pres_peep,
        1.0,
        this.vent_insp_time,
        5.0
      );
      this._breathing.switch_breathing(false);
      this.cpr_enabled = true;
    } else {
      this.cpr_enabled = false;
    }
  }

  set_fio2(new_fio2) {
    this._ventilator.set_fio2(new_fio2);
  }
}
