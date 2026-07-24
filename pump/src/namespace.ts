// src/namespace.ts

import {
    OPCUAServer,
    Variant,
    DataType
} from "node-opcua";

import { Pump } from "./pump";

export async function createPumpNamespace(
    server: OPCUAServer,
    pump: Pump
): Promise<void> {

    const addressSpace = server.engine.addressSpace!;
    const namespace = addressSpace.getOwnNamespace();

    //----------------------------------------------------
    // Factory
    //----------------------------------------------------

    const factory = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Factory"
    });

    const line = namespace.addObject({
        organizedBy: factory,
        browseName: "Line01"
    });

    const pumpObject = namespace.addObject({
        organizedBy: line,
        browseName: "Pump01"
    });

    //----------------------------------------------------
    // Folders
    //----------------------------------------------------

    const identification = namespace.addObject({
        organizedBy: pumpObject,
        browseName: "Identification"
    });

    const commands = namespace.addObject({
        organizedBy: pumpObject,
        browseName: "Commands"
    });

    const status = namespace.addObject({
        organizedBy: pumpObject,
        browseName: "Status"
    });

    const measurements = namespace.addObject({
        organizedBy: pumpObject,
        browseName: "Measurements"
    });

    const diagnostics = namespace.addObject({
        organizedBy: pumpObject,
        browseName: "Diagnostics"
    });

    //----------------------------------------------------
    // Helpers
    //----------------------------------------------------

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

    function addBoolean(
        parent: any,
        name: string,
        getter: () => boolean,
        setter?: (value: boolean) => void
    ) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "Boolean",

            value: {

                get: () =>
                    new Variant({
                        dataType: DataType.Boolean,
                        value: getter()
                    }),

                set: setter
                    ? (variant: any) => {

                        setter(Boolean(variant.value));

                        return null;

                    }
                    : undefined

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

    //----------------------------------------------------
    // Identification
    //----------------------------------------------------

    addString(identification, "Name", () => pump.name);
    addString(identification, "Manufacturer", () => pump.manufacturer);
    addString(identification, "Model", () => pump.model);
    addString(identification, "SerialNumber", () => pump.serialNumber);

    //----------------------------------------------------
    // Commands
    //----------------------------------------------------

    addBoolean(
        commands,
        "Start",
        () => pump.start,
        value => pump.start = value
    );

    addBoolean(
        commands,
        "Stop",
        () => pump.stop,
        value => pump.stop = value
    );

    addBoolean(
        commands,
        "Reset",
        () => pump.reset,
        value => pump.reset = value
    );

    //----------------------------------------------------
    // Status
    //----------------------------------------------------

    addBoolean(status, "Running", () => pump.running);
    addBoolean(status, "Fault", () => pump.fault);

    //----------------------------------------------------
    // Measurements
    //----------------------------------------------------

    addDouble(measurements, "Speed", () => pump.speed);
    addDouble(measurements, "Pressure", () => pump.pressure);
    addDouble(measurements, "Flow", () => pump.flow);
    addDouble(measurements, "Temperature", () => pump.temperature);
    addDouble(measurements, "Power", () => pump.power);
    addDouble(measurements, "Efficiency", () => pump.efficiency);

    //----------------------------------------------------
    // Diagnostics
    //----------------------------------------------------

    addDouble(
        diagnostics,
        "TotalRuntime",
        () => pump.totalRuntime
    );

    addDouble(
        diagnostics,
        "Starts",
        () => pump.starts
    );

}