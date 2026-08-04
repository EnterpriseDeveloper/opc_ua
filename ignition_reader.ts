import { withIgnitionSession } from "./ignition_connection";
import { readElectricityTags } from "./electricity_reader";
import { readMotorTags } from "./motor_reader";
import { readPumpTags } from "./pump_reader";

const tagProvider = process.env.IGNITION_TAG_PROVIDER ?? "Sample_Tags";

async function main(): Promise<void> {
    const tags = await withIgnitionSession(async (session) => ({
        Motor: await readMotorTags(session, tagProvider),
        Pump: await readPumpTags(session, tagProvider),
        Electricity: await readElectricityTags(session, tagProvider)
    }));

    for (const [plcName, values] of Object.entries(tags)) {
        console.log(`\n${plcName}`);
        for (const tag of values) {
            console.log(`${tag.path} = ${tag.value} (${tag.status}, ${tag.nodeId})`);
        }
    }
}

main().catch((error: unknown) => {
    console.error("OPC UA read failed:", error);
    process.exitCode = 1;
});
