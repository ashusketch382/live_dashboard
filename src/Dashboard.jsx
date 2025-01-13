import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Dashboard.css'
const Dashboard = () => {
    const socketRef = useRef(null);
    const [builds, setBuilds] = useState([]);

  useEffect(() => {
    // Fetch all rows on initial load
    async function populateData(){
        try {
            const response = await axios.get('http://10.14.82.102:80/allBuild');
            console.log(response.data.data);
            setBuilds(response.data.data);   
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    }
    populateData();

    // Setup WebSocket connection
    socketRef.current = new WebSocket('ws://10.14.82.102:80');
    socketRef.current.onopen = () =>{
        console.log('Connection established');
    }
    socketRef.current.onmessage = (event) => {
        console.log('Message received:', event.data);
        const updatedBuild = JSON.parse(event.data);
        console.log(updatedBuild);
      setBuilds((prevBuilds) => {
        const index = prevBuilds.findIndex((b) => b.id === updatedBuild.id);
        if (index !== -1) {
          const newBuilds = [...prevBuilds];
          newBuilds[index] = updatedBuild;
          return newBuilds;
        }
        return [...prevBuilds, updatedBuild];
      });
    };

    socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    socketRef.current.onclose = (event) => {
        console.warn('WebSocket closed:', event);
      };
    return () => {
      console.log('Cleaning up WebSocket');
      if(socketRef.current){
        socketRef.current.close();
      }
    };
  }, []);
  if(!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
    return <div> socket Connection establishing.....</div>
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'build running':
        case 'build re-running':
        case 'build rerunning':
        case 'build waiting':
            return 'status-blue';
        case 'build failed':
            return 'status-red';
        case 'build completed':
            return 'status-green';
        default:
            return 'status-yellow';
    }
  };

  const maestroBuilds = builds.filter((build) => {
    const name = build.name.toLowerCase();
    return (
        name.includes("maestro") ||
        /\bstable_f\b/.test(name)
    )
  });

  const l3Builds = builds.filter((build) =>
    build.name.toLowerCase().includes("l3") || build.name.toLowerCase().includes("950") // L3 and 950 builds
  );
  const tenTwoBuilds = builds.filter((build) => {
    const name = build.name.toLowerCase();
    const isTenTwo = name.includes("10.2") || /\bstable_dev\b/.test(name) || name.includes("plugins");
    
    const isUncategorized = 
        !maestroBuilds.some((maestroBuild) => maestroBuild.id === build.id) &&
        !l3Builds.some((l3Build) => l3Build.id === build.id);
        
    return isTenTwo || isUncategorized;
});

  return (
    <div style={{ margin: "20px", overflowX: "auto" }}>
      <table>

        {/* 102 / 10.2 Builds */}
        <thead>
          <tr>
            <th>10.2.X BUILDS (code branch)</th>
            <th>Contents</th>
            <th>Build Start Time(CEST Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {tenTwoBuilds.map((build) => (
            <tr key={build.id}>
              <td>{build.name}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{build.comments}</td>
            </tr>
          ))}
        </tbody>

        <thead>
            <tr>
                <th colSpan="6" style={{ backgroundColor: "transparent", height: "25px" }}></th>
            </tr>
        </thead>

        {/* L3 / 95 Builds */}
        <thead>
        <tr>
            <th>L3 BUILDS (code branch)</th>
            <th>Contents</th>
            <th>Build Start Time(CEST Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {l3Builds.map((build) => (
            <tr key={build.id}>
              <td>{build.name}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{build.comments}</td>
            </tr>
          ))}
        </tbody>

        <thead>
            <tr>
                <th colSpan="6" style={{ backgroundColor: "transparent", height: "25px" }}></th>
            </tr>
        </thead>

        {/* Maestro Builds */}
        <thead style={{ backgroundColor: "#d4e7ff"}}>
          <tr>
            <th>Maestro Builds</th>
            <th>Contents</th>
            <th>Build Start Time(CEST Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {maestroBuilds.map((build) => (
            <tr key={build.id}>
              <td>{build.name}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{build.comments}</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default Dashboard;