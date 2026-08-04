import { ClientSession } from "node-opcua-client";
import { PlcTagGroup, readPlcTags } from "./tags/ignition_tags";

export function readPumpTags(session: ClientSession, tagProvider: string): Promise<PlcTagGroup> {
    return readPlcTags(session, tagProvider, "Pump");
}
