import React, { useState, useEffect } from 'react';
import TextInputComponent from './components/TextInputComponent';
import DisplayComponent from './components/DisplayComponent';
import './App.css';

function App() {
  const [jsonData, setJsonData] = useState({});
  const [jsonText, setJsonText] = useState(JSON.stringify(jsonData, null, 2));

  // When jsonData changes, update jsonText
  useEffect(() => {
    setJsonText(JSON.stringify(jsonData, null, 2));
  }, [jsonData]);

  const handleJsonChange = (updatedJson) => {
    setJsonData(updatedJson);
  };

  const handleJsonTextChange = (text) => {
    setJsonText(text);
    try {
      const parsedJson = JSON.parse(text);
      setJsonData(parsedJson);
    } catch (error) {
      // Optionally handle the error (e.g., invalid JSON input)
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 style={{ fontWeight: 'bold' }}>Outlines</h1>
      </header>
      <div className="Content">
        <TextInputComponent jsonText={jsonText} onJsonChange={handleJsonChange} setJsonText={handleJsonTextChange} />
        <DisplayComponent jsonData={jsonData} setJsonData={setJsonData} onJsonChange={handleJsonChange} />
      </div>
    </div>
  );
}

export default App;
