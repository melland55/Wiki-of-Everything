import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForceGraph2D from 'react-force-graph-2d';
import SearchBar from './SearchBar';

function MapOfEverything() {
    const [topics, setTopics] = useState([]); //For Search bar results
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    const apiEndpoint = process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : window.location.origin + '/api/';

    useEffect(() => {
        const fetchData = async () => {
          try {
            const topics_response = await axios.get(apiEndpoint+'get-topics');
            setTopics(topics_response.data.response.flatMap(topicArr => topicArr));

            const nodes_response = await axios.get(apiEndpoint+'get-nodes');
            setNodes(nodes_response.data.response.flatMap(topicArr => topicArr));

            const edges_response = await axios.get(apiEndpoint+'get-edges');
            setEdges(edges_response.data.response.flatMap(topicArr => topicArr));

          } catch (error) {
            console.error('Error fetching API data:', error);
          }
        };
        fetchData();
        return () => {
        };
      }, []);


  return (
    <div className="wiki-page">
      <header className="custom-header">
        <div className="logo-container">
          <a href="/">
            <img src="/logo.svg" alt="Your Logo" style={{ width: '64px', height: 'auto' }}/>
          </a>
        </div>
        <div className="navigation-container">
            <SearchBar items={topics}/>
        </div>
      </header>
      <div className="content">
    <ForceGraph2D
        graphData={{
            "nodes": [
              { 
                "id": "node1",
                "name": "Node 1",
                "val": 10 
              },
              { 
                "id": "node2",
                "name": "Node 2",
                "val": 15 
              },
              { 
                "id": "node3",
                "name": "Node 3",
                "val": 8 
              },
              { 
                "id": "node4",
                "name": "Node 4",
                "val": 12 
              }
            ],
            "links": [
              {
                "source": "node1",
                "target": "node2"
              },
              {
                "source": "node2",
                "target": "node3"
              },
              {
                "source": "node3",
                "target": "node4"
              },
              {
                "source": "node4",
                "target": "node1"
              }
            ]
          }}
          nodeAutoColorBy="group"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
          }}
        />
        </div>
    </div>
  );
}

export default MapOfEverything;