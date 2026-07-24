// src/models/Pump.ts

export class Pump {

    // ============================
    // Identification
    // ============================

    public readonly name = "Pump01";

    public readonly manufacturer = "Virtual Factory";

    public readonly model = "VF-PUMP-1000";

    public readonly serialNumber = "PUMP-2026-000001";


    // ============================
    // Commands
    // ============================

    public start = false;

    public stop = false;

    public reset = false;


    // ============================
    // Status
    // ============================

    public running = false;

    public fault = false;


    // ============================
    // Measurements
    // ============================

    // rpm
    public speed = 0;

    // bar
    public pressure = 0;

    // m³/h
    public flow = 0;

    // °C
    public temperature = 25;

    // W
    public power = 0;

    // %
    public efficiency = 0;


    // ============================
    // Diagnostics
    // ============================

    // hours
    public totalRuntime = 0;

    // number of starts
    public starts = 0;

}