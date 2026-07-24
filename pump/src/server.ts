// src/server.ts

import {
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua";

import { Pump } from "./pump";
import { createPumpNamespace } from "./namespace";
import { startSimulation } from "./simulation";

async function main(): Promise<void> {

    //----------------------------------------------------
    // Device
    //----------------------------------------------------

    const pump = new Pump();

    //----------------------------------------------------
    // OPC UA Server
    //----------------------------------------------------

    const server = new OPCUAServer({

        port: Number(process.env.OPCUA_PORT ?? 4840),

        resourcePath: process.env.RESOURCE_PATH ?? "/pump",

        buildInfo: {

            productName: "Pump PLC Simulator",

            buildNumber: "1.0.0",

            buildDate: new Date()

        },

        serverInfo: {

            applicationName: {
                text: "Pump OPC UA Server"
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

    await createPumpNamespace(server, pump);

    //----------------------------------------------------
    // Start Simulation
    //----------------------------------------------------

    startSimulation(pump);

    //----------------------------------------------------
    // Start Server
    //----------------------------------------------------

    await server.start();

    console.log("");
    console.log("=========================================");
    console.log(" Pump OPC UA Server Started");
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
    console.log("         └── Pump01");
    console.log("");
    console.log("Ready.");

}

main().catch((err) => {

    console.error(err);
    process.exit(1);

});