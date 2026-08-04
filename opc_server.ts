import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy
} from "node-opcua-client";

import { OPCUACertificateManager } from "node-opcua-certificate-manager";



async function main() {

const certificateManager = new OPCUACertificateManager({
    rootFolder: "./certs"
});

await certificateManager.initialize();

const client = OPCUAClient.create({

    clientCertificateManager: certificateManager,

    securityMode: MessageSecurityMode.SignAndEncrypt,

    securityPolicy: SecurityPolicy.Basic256Sha256,

    endpointMustExist: false

});

    await client.connect("opc.tcp://localhost:62541");

    console.log("Connected");

    const session = await client.createSession();

    console.log("Session created");

    const browseResult = await session.browse("RootFolder");

    console.log(browseResult.references);

    await session.close();
    await client.disconnect();
}

main();