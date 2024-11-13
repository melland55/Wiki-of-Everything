import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';

function MapOfEverything() {
    const [graphData, setGraphData] = useState();

    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

    useEffect(() => {
      const fetchData = async () => {
          console.log("Test");
        try {
          const graph_response = await axios.get(apiEndpoint+'get-graph');
          setGraphData(graph_response.data.response);
        } catch (error) {
          console.error('Error fetching API data:', error);
        }
      };
      fetchData();
      return () => {
      };
      // eslint-disable-next-line
    }, []);

    function nodePaint({ id, x, y }, ctx) {
      const color = "green";
      const radius = 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.fill();
    }


  return (
    <div className="map-page">
      <div className="map-content">
        {graphData ? (
          <ForceGraph2D
            graphData={graphData}
            nodeCanvasObject={(node, ctx) => nodePaint(node, ctx)}
          />
        ) : (
          <p>Loading...</p>
        )}
    
        </div>
    </div>
  );
}

export default MapOfEverything;