import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import { CSS2DRenderer, CSS2DObject} from 'react-force-graph-2d';
import SearchBar from './SearchBar';

function MapOfEverything() {
    const [topics, setTopics] = useState([]); //For Search bar results
    const [graphData, setGraphData] = useState();

    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

    useEffect(() => {
        const fetchData = async () => {
            console.log("Test");
          try {
            const topics_response = await axios.get(apiEndpoint+'get-topics');
            setTopics(topics_response.data.response.flatMap(topicArr => topicArr));

            const graph_response = await axios.get(apiEndpoint+'get-graph');
            setGraphData(graph_response.data.response);
          } catch (error) {
            console.error('Error fetching API data:', error);
          }
        };
        fetchData();
        return () => {
        };
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
      <header className="map-header">
        <div className="logo-container">
          <a href="/">
            <img src="/logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
          </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics}/>
        </div>
      </header>
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