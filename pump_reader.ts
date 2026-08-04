import { ClientSession } from "node-opcua-client";
import { readPlcTags, TagValue } from "./ignition_tags";

export function readPumpTags(session: ClientSession, tagProvider: string): Promise<TagValue[]> {
    return readPlcTags(session, tagProvider, "Pump");
}
