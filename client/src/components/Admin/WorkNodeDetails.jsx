import "./WorkNodeDetails.css";
import NodeContainer from "../NodeDetails/NodeContainer.jsx";

function WorkNodeDetails() {
  return (
    <div className="work-node-details-wrapper">
      <div className="work-node-details-content">
        <div className="header-section">
          <h2 className="page-title">Node Details</h2>
        </div>

        <NodeContainer className="full-width admin-like" />
      </div>
    </div>
  );
}

export default WorkNodeDetails;
