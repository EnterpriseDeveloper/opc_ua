// server.ts

import {
    OPCUAServer,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua";

import { Motor } from "./motor";
import { createMotorNamespace } from "./namespace";
import { startSimulation } from "./simulation";

async function main() {

    //----------------------------------------------------------
    // Create Motor Model
    //----------------------------------------------------------

    const motor = new Motor();

    //----------------------------------------------------------
    // OPC UA Server
    //----------------------------------------------------------

    const server = new OPCUAServer({

        port: 4840,

        resourcePath: "/motor",

        buildInfo: {

            productName: "Motor PLC Simulator",

            buildNumber: "1",

            buildDate: new Date()

        },

        serverInfo: {

            applicationName: {
                text: "Motor OPC UA Server"
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

    //----------------------------------------------------------
    // Initialize Server
    //----------------------------------------------------------

    await server.initialize();

    //----------------------------------------------------------
    // Create Address Space
    //----------------------------------------------------------

    await createMotorNamespace(server, motor);

    //----------------------------------------------------------
    // Start Simulation
    //----------------------------------------------------------

    startSimulation(motor);

    //----------------------------------------------------------
    // Start OPC UA Server
    //----------------------------------------------------------

    await server.start();

    console.log("======================================");
    console.log(" Motor OPC UA Server Started");
    console.log("======================================");

    console.log("");

    console.log("Endpoint:");

    server.endpoints.forEach(endpoint => {

        endpoint.endpointDescriptions().forEach(desc => {

            console.log(
                "   " +
                desc.endpointUrl
            );

            const policy = desc.securityPolicyUri ?? "None";
            console.log(
                "      " +
                SecurityPolicy[policy.split("#").pop() as keyof typeof SecurityPolicy] +
                " | " +
                MessageSecurityMode[desc.securityMode]
            );

        });

    });

    console.log("");

    console.log("Example Address Space:");

    console.log("Objects");
    console.log(" └── Factory");
    console.log("     └── Line01");
    console.log("         └── Motor01");

    console.log("");

    console.log("Ready.");

}

main().catch(err => {

    console.error(err);

});