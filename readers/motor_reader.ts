import { ClientSession } from "node-opcua-client";
import { PlcTagGroup, readPlcTags } from "./tags/ignition_tags";

export function readMotorTags(session: ClientSession, tagProvider: string): Promise<PlcTagGroup> {
    return readPlcTags(session, tagProvider, "Motor");
}
