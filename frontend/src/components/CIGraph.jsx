import ForceGraph2D from "react-force-graph-2d";

export default function CIGraph({ data }) {
  return (
    <div style={{ height: "600px" }}>
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="status"
        nodeLabel={node => `${node.label} (${node.status})`}
      />
    </div>
  );
}
