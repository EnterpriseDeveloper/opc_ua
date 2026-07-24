const {
    AttributeIds,
    BrowseDirection,
    ClientMonitoredItem,
    ClientSubscription,
    DataValue,
    makeBrowsePath,
    MessageSecurityMode,
    MonitoringParametersOptions,
    NodeClassMask,
    OPCUAClient,
    ReadValueIdOptions,
    ResultMask,
    SecurityPolicy,
    TimestampsToReturn,
} = require("node-opcua-client");

(async () => {

    try {
        console.log("1. Connecting...");
        const connectionStrategy = {
            initialDelay: 1000,
            maxRetry: 10
        };

        const client = OPCUAClient.create({
            applicationName: "NodeOPCUA-Client",
            connectionStrategy: connectionStrategy,
            securityMode: MessageSecurityMode.None,
            securityPolicy: SecurityPolicy.None,
            endpointMustExist: false
        });
        // const endpoints = await client.getEndpoints();

        // const appName = endpoints[0].server.applicationName.text;

        // if (appName.includes("Local Discovery")) {
        //     console.log("TEST")
        //     throw new Error("Connected to OPC UA Local Discovery Server instead of the CODESYS OPC UA Server.");
        // }
        const endpointUrl = "opc.tcp://0.0.0.0:4840";
        await client.withSessionAsync(
            {
                endpointUrl: endpointUrl
            },
            async (session) => {

                const nodeBase = "ns=4;s=|var|CODESYS Control Win V3 x64.Application.PLC_PRG.";
                const nodeIds = [
                    nodeBase + "motor.iMotorSpeed",
                    nodeBase + "motor.rVoltage",
                    nodeBase + "motor.xMotorStart",
                    nodeBase + "xLamp",
                    nodeBase + "xPbutton_1",
                    nodeBase + "xPbutton_2",
                ];

                const nodesToRead = nodeIds.map(id => ({ nodeId: id, attributeId: AttributeIds.Value }));

                const dataValues = await session.read(nodesToRead);

                dataValues.forEach((dv, idx) => {
                    const id = nodeIds[idx];
                    if (!dv || (dv.statusCode && dv.statusCode.name !== "Good")) {
                        console.log(`${id} - Status: ${dv ? dv.statusCode.toString() : 'No DataValue returned'}`);
                        return;
                    }
                    const variant = dv.value;
                    const value = variant ? variant.value : undefined;
                    const dataType = variant ? variant.dataType : undefined;
                    console.log(`${id} =`, value, `(dataType: ${dataType})`);
                });

            }
        );


    } catch (err) {
        console.error(err);
    }
})();