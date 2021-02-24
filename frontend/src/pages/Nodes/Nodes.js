import React from "react";
import DeclinedNodesTable from "./DeclinedNodesTable";
import NodesTable from "./NodesTable";
import NodeVoting from "./NodeVoting";

const Nodes = props => {
  return (
    <div>
      <NodeVoting {...props} />
      <NodesTable {...props} />
      <DeclinedNodesTable {...props} />
    </div>
  );
};
export default Nodes;
