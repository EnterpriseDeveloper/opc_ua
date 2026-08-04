import {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    AttributeIds
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

    const root = await session.browse("RootFolder");

    for (const ref of root.references ?? []) {
    console.log(
        ref.browseName.toString(),
        ref.nodeId.toString()
    );
}

const devices = await session.browse("ns=1;i=85");

console.log(devices);

const devices2 = await session.browse("ns=1;i=86");

console.log(devices2);

const devices3 = await session.browse("ns=1;i=87");

console.log(devices3);

const devices4 = await session.browse("ns=1;s=Devices");

console.log(devices4);



//     const dataValue = await session.read({
//     nodeId: "ns=1;i=1011",
//     attributeId: AttributeIds.Value
// });

// console.log(dataValue.value.value);



}

main();