export function calc_gas_composition(
    gc,
    fio2 = 0.205,
    temp = 37,
    humidity = 1.0,
    fico2 = 0.000392
  ) {
    const _fo2_dry = 0.205;
    const _fco2_dry = 0.000392;
    const _fn2_dry = 0.794608;
    const _fother_dry = 0.0;
    const _gas_constant = 62.36367;

    // calculate the dry gas composition depending on the supplied fio2
    let new_fo2_dry = fio2;
    let new_fco2_dry = fico2;
    let new_fn2_dry =
      (_fn2_dry * (1.0 - (fio2 + fico2))) / (1.0 - (_fo2_dry + _fco2_dry));
    let new_fother_dry =
      (_fother_dry * (1.0 - (fio2 + fico2))) / (1.0 - (_fo2_dry + _fco2_dry));

    // make sure the latest pressure is available
    gc.calc_model();

    // get the gas capacitance pressure
    let pressure = gc.pres;

    // calculate the concentration at this pressure and temperature in mmol/l using the gas law
    gc.ctotal = (pressure / (_gas_constant * (273.15 + temp))) * 1000.0;

    // calculate the water vapor pressure, concentration, and fraction for this temperature and humidity (0 - 1)
    gc.ph2o = Math.exp(20.386 - 5132 / (temp + 273)) * humidity;
    gc.fh2o = gc.ph2o / pressure;
    gc.ch2o = gc.fh2o * gc.ctotal;

    // calculate the o2 partial pressure, fraction, and concentration
    gc.po2 = new_fo2_dry * (pressure - gc.ph2o);
    gc.fo2 = gc.po2 / pressure;
    gc.co2 = gc.fo2 * gc.ctotal;

    // calculate the co2 partial pressure, fraction, and concentration
    gc.pco2 = new_fco2_dry * (pressure - gc.ph2o);
    gc.fco2 = gc.pco2 / pressure;
    gc.cco2 = gc.fco2 * gc.ctotal;

    // calculate the n2 partial pressure, fraction, and concentration
    gc.pn2 = new_fn2_dry * (pressure - gc.ph2o);
    gc.fn2 = gc.pn2 / pressure;
    gc.cn2 = gc.fn2 * gc.ctotal;

    // calculate the other gas partial pressure, fraction, and concentration
    gc.pother = new_fother_dry * (pressure - gc.ph2o);
    gc.fother = gc.pother / pressure;
    gc.cother = gc.fother * gc.ctotal;
  }