import "./Tasks.css";

function Tasks() {
  return (
    <>
      <div className="tasks-wrapper">
        <div className="tasks-content">
          <div className="header-section">
            <h2 className="page-title">Tasks</h2>
          </div>

          <table className="tasks-table">
            <thead>
              <tr>
                <th>Node Location</th>
                <th>Task Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>USLS</td>
                <td>Check water flow sensor calibration</td>
              </tr>
              <tr>
                <td>Node B</td>
                <td>Inspect drainage system for blockages</td>
              </tr>
              <tr>
                <td>USLS</td>
                <td>Replace battery unit</td>
              </tr>
              <tr>
                <td>Node B</td>
                <td>Clean debris from sensor area</td>
              </tr>
              <tr>
                <td>USLS</td>
                <td>Verify network connectivity</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default Tasks;
