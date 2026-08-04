import { AttributeIds, ClientSession, NodeClass } from "node-opcua-client";
import { BrowseDirection, ResultMask } from "node-opcua-data-model";
import { BrowseResult, ReferenceDescription } from "node-opcua-service-browse";
import { NodeId, resolveNodeId } from "node-opcua-nodeid";

export interface TagValue {
    nodeId: string;
    path: string;
    status: string;
    value: string;
}

interface VariableNode {
    nodeId: NodeId;
    path: string;
}

export async function browseAllReferences(
    session: ClientSession,
    nodeId: NodeId | string
): Promise<ReferenceDescription[]> {
    const result = await session.browse({
        nodeId,
        browseDirection: BrowseDirection.Forward,
        referenceTypeId: resolveNodeId("HierarchicalReferences"),
        includeSubtypes: true,
        nodeClassMask: 0,
        resultMask:
            ResultMask.ReferenceType |
            ResultMask.IsForward |
            ResultMask.NodeClass |
            ResultMask.BrowseName |
            ResultMask.DisplayName |
            ResultMask.TypeDefinition
    });

    const references = [...(result.references ?? [])];
    let continuationPoint = result.continuationPoint;
    while (continuationPoint && continuationPoint.length > 0) {
        const nextResult: BrowseResult = await session.browseNext(continuationPoint, false);
        references.push(...(nextResult.references ?? []));
        continuationPoint = nextResult.continuationPoint;
    }
    return references;
}

async function findChild(
    session: ClientSession,
    parentNodeId: NodeId | string,
    browseName: string
): Promise<ReferenceDescription> {
    const child = (await browseAllReferences(session, parentNodeId))
        .find((reference) => reference.browseName.name === browseName);
    if (!child) throw new Error(`Cannot find '${browseName}' below ${parentNodeId.toString()}`);
    return child;
}

async function collectVariables(
    session: ClientSession,
    nodeId: NodeId,
    path: string,
    visited: Set<string>
): Promise<VariableNode[]> {
    const variables: VariableNode[] = [];
    for (const reference of await browseAllReferences(session, nodeId)) {
        const childPath = `${path}/${reference.browseName.name}`;
        if (reference.nodeClass === NodeClass.Variable) {
            variables.push({ nodeId: reference.nodeId, path: childPath });
        } else if (reference.nodeClass === NodeClass.Object || reference.nodeClass === NodeClass.View) {
            const childNodeId = reference.nodeId.toString();
            if (!visited.has(childNodeId)) {
                visited.add(childNodeId);
                variables.push(...await collectVariables(session, reference.nodeId, childPath, visited));
            }
        }
    }
    return variables;
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return String(value);
    if (value instanceof Date) return value.toISOString();
    if (Buffer.isBuffer(value)) return value.toString("hex");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export async function readPlcTags(
    session: ClientSession,
    tagProvider: string,
    plcName: string
): Promise<TagValue[]> {
    const tagProviders = await findChild(session, "ObjectsFolder", "Tag Providers");
    const provider = await findChild(session, tagProviders.nodeId, tagProvider);
    const plc = await findChild(session, provider.nodeId, plcName);
    const variables = await collectVariables(
        session,
        plc.nodeId,
        `Tag Providers/${tagProvider}/${plcName}`,
        new Set<string>([plc.nodeId.toString()])
    );
    if (variables.length === 0) return [];

    const values = await session.read(variables.map((variable) => ({
        nodeId: variable.nodeId,
        attributeId: AttributeIds.Value
    })));
    return values.map((dataValue, index) => ({
        nodeId: variables[index].nodeId.toString(),
        path: variables[index].path,
        status: dataValue.statusCode.toString(),
        value: formatValue(dataValue.value.value)
    }));
}
