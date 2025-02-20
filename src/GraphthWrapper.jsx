import React, { useEffect, useCallback, useState, useRef } from "react";
import Graph from "graphology";
import { SigmaContainer, useLoadGraph, useSigma, ControlsContainer, FullScreenControl, ZoomControl } from "@react-sigma/core";
import { GraphSearch } from "@react-sigma/graph-search";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import "@react-sigma/core/lib/style.css";
import "@react-sigma/graph-search/lib/style.css";



export const LoadGraph = ({ filterRelevant }) => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const graphLoaded = useRef(false);

  const loadGraphData = useCallback((file) => {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(data => {
        const graph = new Graph();

        data.nodes.forEach(node => {
          graph.addNode(node.id, {
            label: node.label,
            status: node.status,
            size: node.size,
            x: node.x,
            y: node.y
          });
        });

        data.edges.forEach(edge => {
          graph.addEdge(edge.source, edge.target);
        });
 
        // Set node sizes based on in-degree
        graph.forEachNode(node => {
          const inDegree = graph.inDegree(node);
          graph.setNodeAttribute(node, "size", 1 + Math.min(inDegree * 0.10, 50));
        });

        // Set node colors and zIndex based on status
        graph.forEachNode(node => {
          const status = graph.getNodeAttribute(node, "status");
          const color = status.includes("Relevant") ? "#A9F584" : "#F58576";


          graph.setNodeAttribute(node, "color", color);
          graph.setNodeAttribute(node, "originalColor", color); // Store original color


        });

        // Set edge sizes and colors
        graph.forEachEdge(edge => {
          const defaultEdgeColor = "rgb(0, 43, 70, 0.5)";
          graph.setEdgeAttribute(edge, "size", 0.1);
          graph.setEdgeAttribute(edge, "color", defaultEdgeColor);
          graph.setEdgeAttribute(edge, "originalColor", defaultEdgeColor); // Store original edge color
        });

        // Assign random initial positions with a rectangular spread
        graph.forEachNode(node => {
          graph.setNodeAttribute(node, "x", (Math.random() - 0.5) * 9);
          graph.setNodeAttribute(node, "y", (Math.random() - 0.5) * 5);
        });
        // Load the new graph
        loadGraph(graph);

        graphLoaded.current = true;
      })
      .catch(error => {
        console.error("Error fetching graph data:", error);
      });
  }, [loadGraph]);

  sigma.getCamera().animatedZoom({ duration: 0, factor: 1.5 });

  useEffect(() => {
    const file = filterRelevant ? "/graph_data_filtered.json" : "/graph_data.json";
    loadGraphData(file);
  }, [filterRelevant, loadGraphData]);

  return null;
};


const GraphControls = ({ 
  filterRelevant, 
  selectedNode, 
  setSelectedNode, 
 }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();


  // Filter function that only returns nodes existing in the current graph
  const searchInGraph = useCallback(
    (graph, query) => {
      const lowerQuery = query.toLowerCase();
      const results = [];

      // Loop through all nodes in the *current* graph
      graph.forEachNode((node) => {
        const label = graph.getNodeAttribute(node, "label") || "";
        if (label.toLowerCase().includes(lowerQuery)) {
          results.push({
            id: node,
            label,
            type: "nodes"
          });
        }
      });

      return results;
    },
    [sigma]
  );

  const highlightNode = useCallback(
    (nodeId) => {
      const neighbors = graph.neighbors(nodeId);
      graph.forEachNode((node) => {
        if (node !== nodeId && !neighbors.includes(node)) {
          graph.setNodeAttribute(node, "color", "rgb(0, 43, 70, 0.6)");
        }
      });
      graph.forEachEdge((edge) => {
        const [source, target] = graph.extremities(edge);
        if (
          (source === nodeId && neighbors.includes(target)) ||
          (target === nodeId && neighbors.includes(source))
        ) {
          graph.setEdgeAttribute(edge, "color", "#ffffff");
        } else {
          graph.setEdgeAttribute(edge, "color", "rgb(0, 43, 70, 0.6)");
        }
      });
      // Mark the searched node as highlighted
      graph.setNodeAttribute(nodeId, "color", "#ffffff");
      graph.setNodeAttribute(nodeId, "highlighted", true);
    },
    [graph]
  );

  const unhighlightAll = useCallback(() => {
    graph.forEachNode((node) => {
      graph.setNodeAttribute(node, "highlighted", false);
      const originalColor = graph.getNodeAttribute(node, "originalColor");
      graph.setNodeAttribute(node, "color", originalColor);
    });
    graph.forEachEdge((edge) => {
      const originalColor = graph.getEdgeAttribute(edge, "originalColor");
      graph.setEdgeAttribute(edge, "color", originalColor);
    });
  }, [graph]);

  // Hover event functions that now can refer to unhighlightAll & highlightNode
  useEffect(() => {
    const handleMouseEnter = (event) => {
      if (!selectedNode) {
        unhighlightAll();
        highlightNode(event.node);
      }
    };

    const handleMouseLeave = () => {
      if (!selectedNode) {
        unhighlightAll();
      }
    };

    sigma.on("enterNode", handleMouseEnter);
    sigma.on("leaveNode", handleMouseLeave);
    return () => {
      sigma.off("enterNode", handleMouseEnter);
      sigma.off("leaveNode", handleMouseLeave);
    };
  }, [sigma, selectedNode, unhighlightAll, highlightNode]);

  // onChange for search highlighting:
  const onChange = useCallback(
    (value) => {
      if (value === null) {
        setSelectedNode(null);
        unhighlightAll();
      } else if (value.type === "nodes") {
        setSelectedNode(value.id);
        unhighlightAll();
        highlightNode(value.id);
        // Optionally center camera on that node:
        // const nodePos = sigma.getGraph().getNodeAttributes(value.id);
        // sigma.getCamera().animate(nodePos, { duration: 500 });
      }
    },
    [setSelectedNode, sigma, unhighlightAll, highlightNode]
  );

  // Open node URL on direct node click
  useEffect(() => {
    const handleNodeClick = (event) => {
      const node = event.node;
      const label = sigma.getGraph().getNodeAttribute(node, "label");
      if (label) {
        window.open(`http://${label}`, "_blank");
      }
    };

    sigma.on("clickNode", handleNodeClick);
    return () => {
      sigma.off("clickNode", handleNodeClick);
    };
  }, [sigma]);

  return (
    <>
      <ControlsContainer position="bottom-right">
        <ZoomControl />
        <FullScreenControl />
      </ControlsContainer>
      <ControlsContainer position="top-right">
        <GraphSearch
          key={filterRelevant ? "filteredSearch" : "unfilteredSearch"}
          type="nodes"
          value={selectedNode ? { type: "nodes", id: selectedNode } : null}
          onChange={onChange}
          // Only search among current nodes
          searchInGraph={searchInGraph}
          filterOnResult={true}
        />
      </ControlsContainer>
    </>
  );
};


const ForceAtlas2Controls = ({filterRelevant, setFilterRelevant}) => {
  const sigma = useSigma();
  const forceAtlas2Ref = useRef(null);

  const toggleFilterRelevant = useCallback(() => {
    setFilterRelevant(prev => !prev);
  }, [setFilterRelevant]);


  const startForceAtlas2 = useCallback(() => {
    if (forceAtlas2Ref.current) return;
    const graph = sigma.getGraph();
    forceAtlas2Ref.current = new FA2Layout(graph, {
      settings: {
        slowDown: 6,
        iterationsPerRender: 15, // Increase iterations per render for smoother animation
        barnesHutOptimize: true, // Enable Barnes-Hut optimization
        barnesHutTheta: 0.5, // Theta parameter for Barnes-Hut optimization
        strongGravityMode: true, // Enable strong gravity mode
        gravity: 1, // Adjust gravity to control node spacing
        edgeWeightInfluence: 0, // Influence of edge weights on layout
        scalingRatio: 60, // Adjust scaling ratio to control node spacing
        adjustSizes: true, // Adjust node sizes to avoid overlap
        outboundAttractionDistribution: true, // Distribute attraction forces evenly
      },
    });
    forceAtlas2Ref.current.start();
  }, [sigma]);

  const stopForceAtlas2 = useCallback(() => {
    if (forceAtlas2Ref.current) {
      forceAtlas2Ref.current.stop();
      forceAtlas2Ref.current = null;
    }
  }, []);

  const reloadGraph = useCallback(() => {
    const graph = sigma.getGraph();
    graph.forEachNode(node => {
      graph.setNodeAttribute(node, "x", (Math.random() - 0.5) * 9); // Width range
      graph.setNodeAttribute(node, "y", (Math.random() - 0.5) * 5); // Height range
    });
    sigma.refresh();
  }, [sigma]);

  const openRandomRelevantWebsite = useCallback(() => {
    const graph = sigma.getGraph();
    const relevantNodes = graph.filterNodes(node => graph.getNodeAttribute(node, "status").includes("Relevant"));
    if (relevantNodes.length > 0) {
      const randomNode = relevantNodes[Math.floor(Math.random() * relevantNodes.length)];
      const label = graph.getNodeAttribute(randomNode, "label");
      if (label) {
        const url = `http://${label}`;
        window.open(url, "_blank");
      }
    }
  }, [sigma]);


  return (
    <ControlsContainer position="bottom-left">
      <button onClick={startForceAtlas2}>Start</button>
      <button onClick={stopForceAtlas2}>Stop</button>
      <button onClick={reloadGraph}>Reload</button>
      <button onClick={toggleFilterRelevant}>
        {filterRelevant ? "Show All" : "Filter Relevant"}
      </button>
      <button onClick={openRandomRelevantWebsite}>Open Random</button>
    </ControlsContainer>
      );
};

const DisplayGraph = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterRelevant, setFilterRelevant] = useState(true);

  useEffect(() => {
    setSelectedNode(null);
  }, [filterRelevant]);

  return (
    <div id="sigma-container" className="graph-container">
      <SigmaContainer
        key={filterRelevant ? "filteredSigma" : "unfilteredSigma"}
        id="sigma-container"
        className="my-sigma"
        settings={{ zIndex: false }}
      >
        <LoadGraph filterRelevant={filterRelevant} />
        <GraphControls
          filterRelevant={filterRelevant}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
        <ForceAtlas2Controls 
          filterRelevant={filterRelevant} 
          setFilterRelevant={setFilterRelevant}
        />
      </SigmaContainer>
    </div>
  );
};

export default DisplayGraph;