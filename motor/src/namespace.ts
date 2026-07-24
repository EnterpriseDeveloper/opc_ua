import {
    OPCUAServer,
    Variant,
    DataType,
    StatusCodes
} from "node-opcua";

import { Motor } from "./motor";

export async function createMotorNamespace(
    server: OPCUAServer,
    motor: Motor
) {
    const addressSpace = server.engine.addressSpace!;

    const namespace = addressSpace.getOwnNamespace();

    const objects = addressSpace.rootFolder.objects;

    //--------------------------------------------------
    // Factory
    //--------------------------------------------------

    const factory = namespace.addObject({
        organizedBy: objects,
        browseName: "Factory"
    });

    //--------------------------------------------------
    // Line01
    //--------------------------------------------------

    const line = namespace.addObject({
        organizedBy: factory,
        browseName: "Line01"
    });

    //--------------------------------------------------
    // Motor01
    //--------------------------------------------------

    const motorNode = namespace.addObject({
        organizedBy: line,
        browseName: "Motor01"
    });

    //--------------------------------------------------
    // Folders
    //--------------------------------------------------

    const identification = namespace.addObject({
        componentOf: motorNode,
        browseName: "Identification"
    });

    const commands = namespace.addObject({
        componentOf: motorNode,
        browseName: "Commands"
    });

    const status = namespace.addObject({
        componentOf: motorNode,
        browseName: "Status"
    });

    const measurements = namespace.addObject({
        componentOf: motorNode,
        browseName: "Measurements"
    });

    //--------------------------------------------------
    // Helper Double
    //--------------------------------------------------

    function addDouble(parent: any, name: string, getter: () => number) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "Double",

            value: {

                get() {

                    return new Variant({
                        dataType: DataType.Double,
                        value: getter()
                    });

                }

            }

        });

    }

    //--------------------------------------------------
    // Helper Boolean RO
    //--------------------------------------------------

    function addBoolean(parent: any, name: string, getter: () => boolean) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "Boolean",

            value: {

                get() {

                    return new Variant({
                        dataType: DataType.Boolean,
                        value: getter()
                    });

                }

            }

        });

    }

    //--------------------------------------------------
    // Helper String
    //--------------------------------------------------

    function addString(parent: any, name: string, value: string) {

        namespace.addVariable({

            componentOf: parent,

            browseName: name,

            dataType: "String",

            value: {

                get() {

                    return new Variant({

                        dataType: DataType.String,

                        value

                    });

                }

            }

        });

    }

    //--------------------------------------------------
    // Identification
    //--------------------------------------------------

    addString(identification, "Name", "Motor01");

    addString(identification, "Manufacturer", "OpenAI Industries");

    addString(identification, "SerialNumber", "MTR-000001");

    //--------------------------------------------------
    // Measurements
    //--------------------------------------------------

    addDouble(measurements, "Speed", () => motor.speed);

    addDouble(measurements, "Voltage", () => motor.voltage);

    addDouble(measurements, "Current", () => motor.current);

    addDouble(measurements, "Temperature", () => motor.temperature);

    addDouble(measurements, "Torque", () => motor.torque);

    addDouble(measurements, "Power", () => motor.power);

    //--------------------------------------------------
    // Status
    //--------------------------------------------------

    addBoolean(status, "Running", () => motor.running);

    addBoolean(status, "Fault", () => motor.fault);

    //--------------------------------------------------
    // Commands
    //--------------------------------------------------

    namespace.addVariable({

        componentOf: commands,

        browseName: "Start",

        dataType: "Boolean",

        value: {

            get() {

                return new Variant({

                    dataType: DataType.Boolean,

                    value: motor.start

                });

            },

            set(variant: any) {

                motor.start = variant.value;

                if (motor.start) {

                    motor.stop = false;

                }

                return StatusCodes.Good;

            }

        }

    });

    namespace.addVariable({

        componentOf: commands,

        browseName: "Stop",

        dataType: "Boolean",

        value: {

            get() {

                return new Variant({

                    dataType: DataType.Boolean,

                    value: motor.stop

                });

            },

            set(variant: any) {

                motor.stop = variant.value;

                if (motor.stop) {

                    motor.start = false;

                }

                return StatusCodes.Good;

            }

        }

    });

    namespace.addVariable({

        componentOf: commands,

        browseName: "Reset",

        dataType: "Boolean",

        value: {

            get() {

                return new Variant({

                    dataType: DataType.Boolean,

                    value: false

                });

            },

            set() {

                motor.fault = false;

                return StatusCodes.Good;

            }

        }

    });

    console.log("Motor namespace created.");
}