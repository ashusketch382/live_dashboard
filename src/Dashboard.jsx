import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const socketRef = useRef(null);
    const [builds, setBuilds] = useState([]);
    const reconnectInterval = useRef(null);

    const connectWebSocket = () => {
        if (socketRef.current) {
            socketRef.current.close(); // Ensure no duplicate connection
        }

        socketRef.current = new WebSocket('ws://10.14.82.102:80');

        socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
            clearInterval(reconnectInterval.current); // Stop reconnecting if successful
        };

        socketRef.current.onmessage = (event) => {
            console.log('Message received:', event.data);
            const updatedBuild = JSON.parse(event.data);
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

            if (!event.wasClean) {
                console.log('Attempting to reconnect WebSocket in 5 seconds...');
                if (!reconnectInterval.current) {
                    reconnectInterval.current = setInterval(() => {
                        console.log('Reconnecting WebSocket...');
                        connectWebSocket();
                    }, 5000);
                }
            }
        };
    };

    useEffect(() => {
        // Fetch initial data
        async function populateData() {
            try {
                const response = await axios.get('http://10.14.82.102:80/allBuild');
                setBuilds(response.data.data);
            } catch (error) {
                console.error('Error fetching initial data:', error);
            }
        }
        populateData();

        // Connect WebSocket
        connectWebSocket();

        return () => {
            console.log('Cleaning up WebSocket');
            if (socketRef.current) {
                socketRef.current.close();
            }
            clearInterval(reconnectInterval.current);
        };
    }, []);

	
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        return <div>Socket Connection Establishing...</div>;
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
  
    const createJiraLinks = (text) => {
      if (!text) return text;
      const regex = /(WA-\d{6})/g; // Matches WA- followed by 6 digits
      return text.split(regex).map((part, index) => {
          if (regex.test(part)) {
              const jiraUrl = `https://hclsw-jiracentral.atlassian.net/browse/${part}`;
              return (
                  <a
                      key={index}
                      href={jiraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                      {part}
                  </a>
              );
          }
          return part;
      });
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
      
      const isAlreadyCategorized =
        maestroBuilds.some((maestroBuild) => maestroBuild.id === build.id) ||
        l3Builds.some((l3Build) => l3Build.id === build.id);
  
      return isTenTwo && !isAlreadyCategorized;
  });

  return (
    <div style={{ margin: "20px", overflowX: "auto" }}>
      <table>

        {/* 102 / 10.2 Builds */}
        <thead>
          <tr>
            <th>10.2.4 BUILDS (code branch)</th>
            <th>Contents</th>
            <th>Build Start Time(Your Local Time Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {tenTwoBuilds.map((build) => (
            <tr key={build.id}>
              <td>{build.name.replace(/\(/, ' (')}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{createJiraLinks(build.comments)}</td>
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
            <th>Build Start Time(Your Local Time Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {l3Builds.map((build) => (
            <tr key={build.id}>
              <td>{build.name.replace(/\(/, ' (')}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{createJiraLinks(build.comments)}</td>
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
            <th>Build Start Time(Your Local Time Zone)</th>
            <th>On-Prem Status</th>
            <th>Docker Status</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {maestroBuilds.map((build) => (
            <tr key={build.id}>
              <td>{build.name.replace(/\(/, ' (')}</td>
              <td>{build.content}</td>
              <td>{new Date(build.buildStartTime).toLocaleString()}</td>
              <td className={getStatusClass(build.onpremStatus)}>{build.onpremStatus}</td>
              <td className={getStatusClass(build.dockerStatus)}>{build.dockerStatus}</td>
              <td>{createJiraLinks(build.comments)}</td>
            </tr>
          ))}
        </tbody>

      </table>
      <br></br>
      <h4>Note: And here is some info about harbor tags and nfs paths for builds And sharing some paths for old/released packages/versions in the <a href='https://hclo365-my.sharepoint.com/:x:/r/personal/ashutoshsi_hcl_com1/_layouts/15/doc2.aspx?sourcedoc=%7BD1501DDE-ADAE-47E6-B61C-983731460A22%7D&file=Book.xlsx&action=editnew&mobileredirect=true&wdNewAndOpenCt=1695649194272&ct=1695649195167&wdPreviousSession=9632b2ad-526d-43a4-99df-9c2055c2c796&wdOrigin=OFFICECOM-WEB.START.NEW&cid=db85782f-0f36-40d5-a68f-2fcc722ce739&wdPreviousSessionSrc=HarmonyWeb' target='_blank'>NFS PATHS EXCEL</a></h4>
    </div>
  );
};

export default Dashboard;