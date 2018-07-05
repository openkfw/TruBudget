import React from "react";
import NodesTable from "./NodesTable";
import NodeVoting from "./NodeVoting";

const Nodes = props => {
  return (
    <div>
      <NodeVoting {...props} />
      <NodesTable {...props} />
    </div>
  );
};
export default Nodes;
