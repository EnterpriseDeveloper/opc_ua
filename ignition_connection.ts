import { AttributeIds, ClientSession, MessageSecurityMode, OPCUAClient, SecurityPolicy } from "node-opcua-client";
import { OPCUACertificateManager } from "node-opcua-certificate-manager";
import { DataType, Variant } from "node-opcua-variant";

const endpointUrl = process.env.OPCUA_ENDPOINT ?? "opc.tcp://localhost:62541";

export async function withIgnitionSession<T>(
    operation: (session: ClientSession) => Promise<T>
): Promise<T> {
    const certificateManager = new OPCUACertificateManager({ rootFolder: "./certs" });
    await certificateManager.initialize();

    const client = OPCUAClient.create({
        clientCertificateManager: certificateManager,
        securityMode: MessageSecurityMode.SignAndEncrypt,
        securityPolicy: SecurityPolicy.Basic256Sha256,
        endpointMustExist: false
    });

    try {
        await client.connect(endpointUrl);
        const session = await client.createSession();
        try {
            return await operation(session);
        } finally {
            await session.close();
        }
    } finally {
        await client.disconnect();
    }
}

export async function writeBooleanTag(nodeId: string, value: boolean): Promise<string> {
    return withIgnitionSession(async (session) => {
        const statusCode = await session.write({
            nodeId,
            attributeId: AttributeIds.Value,
            value: {
                value: new Variant({ dataType: DataType.Boolean, value })
            }
        });
        return statusCode.toString();
    });
}
