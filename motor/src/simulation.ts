// simulation.ts

import { Motor } from "./motor";

const UPDATE_TIME = 100; // ms

export function startSimulation(motor: Motor) {

    console.log("Motor simulation started.");

    setInterval(() => {

        //---------------------------------------
        // Commands
        //---------------------------------------

        if (motor.start) {
            motor.running = true;
            motor.targetSpeed = 1500;
        }

        if (motor.stop) {
            motor.targetSpeed = 0;
        }

        //---------------------------------------
        // Speed (Smooth acceleration)
        //---------------------------------------

        const acceleration = 0.08;

        motor.speed +=
            (motor.targetSpeed - motor.speed) * acceleration;

        if (motor.speed < 1) {
            motor.speed = 0;
        }

        //---------------------------------------
        // Running
        //---------------------------------------

        if (motor.speed === 0 && motor.targetSpeed === 0) {
            motor.running = false;
        }

        //---------------------------------------
        // Voltage
        //---------------------------------------

        motor.voltage =
            400 +
            random(-1.2, 1.2);

        //---------------------------------------
        // Current
        //---------------------------------------

        if (motor.running) {

            const load =
                Math.abs(
                    motor.targetSpeed - motor.speed
                ) / 1500;

            motor.current =
                4 +
                load * 12 +
                random(-0.3, 0.3);

        } else {

            motor.current = 0;

        }

        //---------------------------------------
        // Power
        //---------------------------------------

        motor.power =
            (motor.voltage *
                motor.current *
                1.732 *
                0.92) / 1000;

        //---------------------------------------
        // Torque
        //---------------------------------------

        if (motor.speed > 5) {

            motor.torque =
                (9550 * motor.power) /
                motor.speed;

        } else {

            motor.torque = 0;

        }

        //---------------------------------------
        // Temperature
        //---------------------------------------

        if (motor.running) {

            motor.temperature +=
                motor.current * 0.01;

        } else {

            motor.temperature -= 0.03;

        }

        if (motor.temperature < 25) {
            motor.temperature = 25;
        }

        //---------------------------------------
        // Fault
        //---------------------------------------

        if (motor.temperature > 90) {

            motor.fault = true;

            motor.targetSpeed = 0;

            motor.start = false;

        }

        //---------------------------------------
        // Auto reset Stop
        //---------------------------------------

        if (motor.speed === 0) {
            motor.stop = false;
        }

    }, UPDATE_TIME);

}

function random(min: number, max: number): number {

    return min + Math.random() * (max - min);

}