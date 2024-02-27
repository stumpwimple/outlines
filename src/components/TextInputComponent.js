import React from 'react';

function TextInputComponent({ onJsonChange, jsonText, setJsonText }) {
    const handleChange = (event) => {
      const newText = event.target.value;
      setJsonText(newText); // Always update the text input to reflect user input
  
      try {
        const json = JSON.parse(newText);
        onJsonChange(json);
      } catch (error) {
      }
    };
  
    return (
      <textarea
        placeholder="Enter JSON here"
        value={jsonText}
        onChange={handleChange}
      ></textarea>
    );
  }
  
  

export default TextInputComponent;
