// src/simulation.ts

import { ElectricityMeter } from "./ElectricityMeter";

function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function round(value: number, digits = 2): number {
    return Number(value.toFixed(digits));
}

export function startSimulation(meter: ElectricityMeter): void {

    setInterval(() => {

        //--------------------------------------------------
        // Voltages (395...405 V)
        //--------------------------------------------------

        meter.voltageL1 = round(400 + random(-2.5, 2.5));
        meter.voltageL2 = round(400 + random(-2.5, 2.5));
        meter.voltageL3 = round(400 + random(-2.5, 2.5));

        //--------------------------------------------------
        // Frequency (49.95...50.05 Hz)
        //--------------------------------------------------

        meter.frequency = round(50 + random(-0.03, 0.03), 3);

        //--------------------------------------------------
        // Current
        //--------------------------------------------------

        if (meter.connected) {

            meter.currentL1 = round(random(6, 9));
            meter.currentL2 = round(random(6, 9));
            meter.currentL3 = round(random(6, 9));

        } else {

            meter.currentL1 = 0;
            meter.currentL2 = 0;
            meter.currentL3 = 0;

        }

        //--------------------------------------------------
        // Average Values
        //--------------------------------------------------

        const voltage =
            (meter.voltageL1 +
             meter.voltageL2 +
             meter.voltageL3) / 3;

        const current =
            (meter.currentL1 +
             meter.currentL2 +
             meter.currentL3) / 3;

        //--------------------------------------------------
        // Power Factor
        //--------------------------------------------------

        meter.powerFactor = round(random(0.91, 0.97), 3);

        //--------------------------------------------------
        // Three Phase Power
        //--------------------------------------------------

        meter.apparentPower =
            round(
                Math.sqrt(3) *
                voltage *
                current
            );

        meter.activePower =
            round(
                meter.apparentPower *
                meter.powerFactor
            );

        meter.reactivePower =
            round(
                Math.sqrt(
                    Math.pow(meter.apparentPower, 2) -
                    Math.pow(meter.activePower, 2)
                )
            );

        //--------------------------------------------------
        // Energy (kWh)
        //--------------------------------------------------

        meter.energyTotal +=
            meter.activePower / 1000 / 3600;

        meter.energyToday +=
            meter.activePower / 1000 / 3600;

        meter.energyTotal =
            round(meter.energyTotal, 3);

        meter.energyToday =
            round(meter.energyToday, 3);

        //--------------------------------------------------
        // Diagnostics
        //--------------------------------------------------

        meter.voltageImbalance = round(
            Math.max(
                meter.voltageL1,
                meter.voltageL2,
                meter.voltageL3
            ) -
            Math.min(
                meter.voltageL1,
                meter.voltageL2,
                meter.voltageL3
            ),
            2
        );

        meter.currentImbalance = round(
            Math.max(
                meter.currentL1,
                meter.currentL2,
                meter.currentL3
            ) -
            Math.min(
                meter.currentL1,
                meter.currentL2,
                meter.currentL3
            ),
            2
        );

        meter.temperature = round(
            28 + current * 1.8 + random(-0.5, 0.5)
        );

        meter.communicationQuality = 100;

        //--------------------------------------------------
        // Status
        //--------------------------------------------------

        meter.warning =
            meter.voltageImbalance > 4;

        meter.alarm =
            meter.temperature > 70;

    }, 1000);

}