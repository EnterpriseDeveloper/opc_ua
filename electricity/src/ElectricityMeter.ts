// src/models/ElectricityMeter.ts

export class ElectricityMeter {

    // ============================
    // Identification
    // ============================

    public readonly name = "PowerMeter01";

    public readonly manufacturer = "Virtual Factory";

    public readonly model = "VF-PM-1000";

    public readonly serialNumber = "PM-2026-000001";


    // ============================
    // Voltages (V)
    // ============================

    public voltageL1 = 400.0;

    public voltageL2 = 400.0;

    public voltageL3 = 400.0;


    // ============================
    // Currents (A)
    // ============================

    public currentL1 = 0;

    public currentL2 = 0;

    public currentL3 = 0;


    // ============================
    // Frequency (Hz)
    // ============================

    public frequency = 50.0;


    // ============================
    // Power
    // ============================

    public activePower = 0;      // W

    public reactivePower = 0;    // var

    public apparentPower = 0;    // VA

    public powerFactor = 1.0;


    // ============================
    // Energy
    // ============================

    public energyToday = 0;      // kWh

    public energyTotal = 0;      // kWh


    // ============================
    // Diagnostics
    // ============================

    public voltageImbalance = 0;

    public currentImbalance = 0;

    public temperature = 25;

    public communicationQuality = 100;


    // ============================
    // Status
    // ============================

    public connected = true;

    public warning = false;

    public alarm = false;

}