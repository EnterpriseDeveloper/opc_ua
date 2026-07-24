// src/server.ts

import {
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua";

import { ElectricityMeter } from "./src/ElectricityMeter";
import { createElectricityNamespace } from "./src/namespace";
import { startSimulation } from "./src/simulation";

async function main() {

    //----------------------------------------------------
    // Device
    //----------------------------------------------------

    const meter = new ElectricityMeter();

    //----------------------------------------------------
    // OPC UA Server
    //----------------------------------------------------

    const server = new OPCUAServer({

        port: Number(process.env.OPCUA_PORT ?? 4840),

        resourcePath: process.env.RESOURCE_PATH ?? "/electricity",

        buildInfo: {

            productName: "Electricity PLC Simulator",

            buildNumber: "1.0.0",

            buildDate: new Date()

        },

        serverInfo: {

            applicationName: {
                text: "Electricity OPC UA Server"
            }

        },

        allowAnonymous: true,

        securityPolicies: [
            SecurityPolicy.None,
            SecurityPolicy.Basic256Sha256
        ],

        securityModes: [
            MessageSecurityMode.None,
            MessageSecurityMode.Sign,
            MessageSecurityMode.SignAndEncrypt
        ]

    });

    //----------------------------------------------------
    // Initialize
    //----------------------------------------------------

    await server.initialize();

    await createElectricityNamespace(server, meter);

    startSimulation(meter);

    //----------------------------------------------------
    // Start
    //----------------------------------------------------

    await server.start();

    console.log("");
    console.log("=========================================");
    console.log(" Electricity OPC UA Server Started");
    console.log("=========================================");
    console.log("");

    server.endpoints.forEach(endpoint => {

        endpoint.endpointDescriptions().forEach(desc => {

            console.log("-----------------------------------------");
            console.log("Endpoint :", desc.endpointUrl);
            console.log("Security :", desc.securityPolicyUri);
            console.log("Mode     :", MessageSecurityMode[desc.securityMode]);

        });

    });

    console.log("");
    console.log("Address Space");
    console.log("");
    console.log("Objects");
    console.log(" └── Factory");
    console.log("     └── Line01");
    console.log("         └── PowerMeter01");
    console.log("");
    console.log("Ready.");
}

main().catch(err => {

    console.error(err);

});