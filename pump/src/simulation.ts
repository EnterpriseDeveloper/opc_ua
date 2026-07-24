// src/simulation.ts

import { Pump } from "./pump";

function round(value: number, digits = 2): number {
    return Number(value.toFixed(digits));
}

function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function startSimulation(pump: Pump): void {

    const targetSpeed = 1450; // rpm

    setInterval(() => {

        //--------------------------------------------------
        // Start
        //--------------------------------------------------

        if (pump.start && !pump.running) {

            pump.running = true;
            pump.start = false;
            pump.starts++;

        }

        //--------------------------------------------------
        // Stop
        //--------------------------------------------------

        if (pump.stop) {

            pump.running = false;
            pump.stop = false;

        }

        //--------------------------------------------------
        // Reset
        //--------------------------------------------------

        if (pump.reset) {

            pump.fault = false;
            pump.reset = false;

        }

        //--------------------------------------------------
        // Speed
        //--------------------------------------------------

        if (pump.running) {

            if (pump.speed < targetSpeed) {
                pump.speed += 25;
            }

        } else {

            if (pump.speed > 0) {
                pump.speed -= 35;
            }

        }

        if (pump.speed < 0) {
            pump.speed = 0;
        }

        if (pump.speed > targetSpeed) {
            pump.speed = targetSpeed;
        }

        //--------------------------------------------------
        // Pressure (bar)
        //--------------------------------------------------

        pump.pressure = round(
            (pump.speed / targetSpeed) * 5 +
            random(-0.05, 0.05)
        );

        if (pump.pressure < 0) {
            pump.pressure = 0;
        }

        //--------------------------------------------------
        // Flow (m3/h)
        //--------------------------------------------------

        pump.flow = round(
            (pump.speed / targetSpeed) * 40 +
            random(-0.3, 0.3)
        );

        if (pump.flow < 0) {
            pump.flow = 0;
        }

        //--------------------------------------------------
        // Power (W)
        //--------------------------------------------------

        pump.power = round(
            (pump.speed / targetSpeed) * 4200
        );

        //--------------------------------------------------
        // Efficiency (%)
        //--------------------------------------------------

        if (pump.running) {

            pump.efficiency = round(
                90 + random(-2, 2)
            );

        } else {

            pump.efficiency = 0;

        }

        //--------------------------------------------------
        // Temperature (°C)
        //--------------------------------------------------

        if (pump.running) {

            pump.temperature += 0.05;

        } else {

            pump.temperature -= 0.03;

        }

        if (pump.temperature < 25) {
            pump.temperature = 25;
        }

        //--------------------------------------------------
        // Runtime
        //--------------------------------------------------

        if (pump.running) {

            // hours

            pump.totalRuntime += 1 / 3600;

        }

        //--------------------------------------------------
        // Fault Detection
        //--------------------------------------------------

        if (pump.temperature > 80) {

            pump.fault = true;
            pump.running = false;

        }

    }, 1000);

}