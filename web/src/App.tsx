import { useEffect } from "react";
import { Map } from "./map/Map";
import { client } from "./lib/appwrite-client";

function App() {
  useEffect(() => {
    client.ping();
  }, []);

  return (
    <div className="h-screen flex flex-col justify-stretch">
      <Map />
    </div>
  );
}

export default App;
