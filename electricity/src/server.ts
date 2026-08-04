// src/server.ts

import {
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua";

import { ElectricityMeter } from "./ElectricityMeter";
import { createElectricityNamespace } from "./namespace";
import { startSimulation } from "./simulation";

async function main() {

    //----------------------------------------------------
    // Device
    //----------------------------------------------------

    const meter = new ElectricityMeter();

    //----------------------------------------------------
    // OPC UA Server
    //----------------------------------------------------

    const server = new OPCUAServer({


        port: 4843,
        alternateHostname: "192.168.0.100",
        certificateFile: "./certs/PLC_Electricity.crt",
        privateKeyFile: "./certs/PLC_Electricity.pem",
        resourcePath: process.env.RESOURCE_PATH ?? "/electricity",

        buildInfo: {

            productName: "Electricity PLC Simulator",

            buildNumber: "1.0.0",

            buildDate: new Date()

        },

        serverInfo: {

            applicationUri: "urn://betme/plc/electricity",
            applicationName: {
                text: "Electricity OPC UA Server",
                locale: "en"
            },
            productUri: "urn://betme/plc/electricity"

        },
        securityPolicies: [
            SecurityPolicy.Basic256Sha256
        ],
        securityModes: [
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