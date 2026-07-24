// src/namespace.ts

import {
    OPCUAServer,
    Variant,
    DataType
} from "node-opcua";

import { ElectricityMeter } from "./ElectricityMeter";

export async function createElectricityNamespace(
    server: OPCUAServer,
    meter: ElectricityMeter
): Promise<void> {

    const addressSpace = server.engine.addressSpace!;

    const namespace = addressSpace.getOwnNamespace();

    //--------------------------------------------------
    // Factory
    //--------------------------------------------------

    const factory = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Factory"
    });

    const line = namespace.addObject({
        organizedBy: factory,
        browseName: "Line01"
    });

    const powerMeter = namespace.addObject({
        organizedBy: line,
        browseName: "PowerMeter01"
    });

    //--------------------------------------------------
    // Folders
    //--------------------------------------------------

    const identification = namespace.addObject({
        organizedBy: powerMeter,
        browseName: "Identification"
    });

    const measurements = namespace.addObject({
        organizedBy: powerMeter,
        browseName: "Measurements"
    });

    const diagnostics = namespace.addObject({
        organizedBy: powerMeter,
        browseName: "Diagnostics"
    });

    const status = namespace.addObject({
        organizedBy: powerMeter,
        browseName: "Status"
    });

    //--------------------------------------------------
    // Helpers
    //--------------------------------------------------

    function addDouble(parent: any, name: string, getter: () => number) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "Double",

            value: {
                get: () =>
                    new Variant({
                        dataType: DataType.Double,
                        value: getter()
                    })
            }

        });

    }

    function addBoolean(parent: any, name: string, getter: () => boolean) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "Boolean",

            value: {
                get: () =>
                    new Variant({
                        dataType: DataType.Boolean,
                        value: getter()
                    })
            }

        });

    }

    function addString(parent: any, name: string, getter: () => string) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "String",

            value: {
                get: () =>
                    new Variant({
                        dataType: DataType.String,
                        value: getter()
                    })
            }

        });

    }

    //--------------------------------------------------
    // Identification
    //--------------------------------------------------

    addString(identification, "Name", () => meter.name);
    addString(identification, "Manufacturer", () => meter.manufacturer);
    addString(identification, "Model", () => meter.model);
    addString(identification, "SerialNumber", () => meter.serialNumber);

    //--------------------------------------------------
    // Voltages
    //--------------------------------------------------

    addDouble(measurements, "VoltageL1", () => meter.voltageL1);
    addDouble(measurements, "VoltageL2", () => meter.voltageL2);
    addDouble(measurements, "VoltageL3", () => meter.voltageL3);

    //--------------------------------------------------
    // Currents
    //--------------------------------------------------

    addDouble(measurements, "CurrentL1", () => meter.currentL1);
    addDouble(measurements, "CurrentL2", () => meter.currentL2);
    addDouble(measurements, "CurrentL3", () => meter.currentL3);

    //--------------------------------------------------
    // Frequency
    //--------------------------------------------------

    addDouble(measurements, "Frequency", () => meter.frequency);

    //--------------------------------------------------
    // Power
    //--------------------------------------------------

    addDouble(measurements, "ActivePower", () => meter.activePower);
    addDouble(measurements, "ReactivePower", () => meter.reactivePower);
    addDouble(measurements, "ApparentPower", () => meter.apparentPower);
    addDouble(measurements, "PowerFactor", () => meter.powerFactor);

    //--------------------------------------------------
    // Energy
    //--------------------------------------------------

    addDouble(measurements, "EnergyToday", () => meter.energyToday);
    addDouble(measurements, "EnergyTotal", () => meter.energyTotal);

    //--------------------------------------------------
    // Diagnostics
    //--------------------------------------------------

    addDouble(diagnostics, "VoltageImbalance", () => meter.voltageImbalance);
    addDouble(diagnostics, "CurrentImbalance", () => meter.currentImbalance);
    addDouble(diagnostics, "Temperature", () => meter.temperature);
    addDouble(diagnostics, "CommunicationQuality", () => meter.communicationQuality);

    //--------------------------------------------------
    // Status
    //--------------------------------------------------

    addBoolean(status, "Connected", () => meter.connected);
    addBoolean(status, "Warning", () => meter.warning);
    addBoolean(status, "Alarm", () => meter.alarm);
}