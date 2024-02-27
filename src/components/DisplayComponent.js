import React, { useState } from 'react';


function DisplayComponent({ jsonData, setJsonData, onJsonChange }) {

    function handleKeyChanges(parentKey, oldKey, newKey) {
        setJsonData((prevJson) => {
          const updateNestedObject = (obj, keys, newKey, oldValue) => {
            const entries = Object.entries(obj);
            // Find index of the old key to maintain order
            const oldIndex = entries.findIndex(([key]) => key === oldKey);
            if (oldIndex > -1) {
              // Replace old key with new key in the same position
              entries[oldIndex] = [newKey, oldValue];
            }
            // Convert entries back to object
            return Object.fromEntries(entries);
          };
      
          const keys = parentKey.split('.').filter(key => key).concat(oldKey);
          if (keys.length === 1) { // Root level
            const oldValue = prevJson[oldKey];
            const updated = updateNestedObject(prevJson, keys, newKey, oldValue);
            return { ...updated };
          } else { // Nested object
            let current = prevJson;
            for (let i = 0; i < keys.length - 1; i++) {
              if (i === keys.length - 2) {
                current[keys[i]] = updateNestedObject(current[keys[i]], keys, newKey, current[keys[i]][oldKey]);
              } else {
                current = current[keys[i]];
              }
            }
            return { ...prevJson };
          }
        });
    }
      
    function EditablePrimitiveArrayItem({ value, index, parentKey, onChange }) {
        const [isEditable, setIsEditable] = useState(false);
        const [inputValue, setInputValue] = useState(value);
    
        const handleClick = () => {
            setIsEditable(true);
        };
    
        const handleChange = (e) => {
            setInputValue(e.target.value);
        };
    
        const handleBlur = () => {
            setIsEditable(false);
            onChange(parentKey, index, inputValue);
        };
    
        return isEditable ? (
            <input type="text" value={inputValue} onChange={handleChange} onBlur={handleBlur} autoFocus />
        ) : (
            <div onClick={handleClick}>{value}</div>
        );
    }
    
    
    function RenderJsonFields({ data, parentKey = '', handleFieldChange, handleKeyChange }) {
        if (!data) return null; // No data to render
    
        const handleArrayItemChange = (parentKey, index, newValue) => {
            setJsonData((prevJson) => {
              const keys = parentKey.split('.').slice(1); // Removing the first element, assuming it's empty because parentKey starts with '.'
          
              const updateArrayItem = (data, keys, index, newValue) => {
                if (keys.length === 0) { // We've reached the target array
                  // Ensure the operation is safe
                  if (Array.isArray(data) && data.length > index) {
                    const newData = [...data]; // Clone the array for immutability
                    newData[index] = newValue; // Update the item at index
                    return newData;
                  }
                  return data; // In case of an unexpected structure, return the data as is
                }
          
                const [currentKey, ...restKeys] = keys;
                if (!data[currentKey] || typeof data[currentKey] !== 'object') {
                  // If the current path doesn't exist or isn't an object, return data as is
                  return data;
                }
          
                // If the current path is an object, recursively update the nested structure
                const updatedData = { ...data, [currentKey]: updateArrayItem(data[currentKey], restKeys, index, newValue) };
                return updatedData;
              };
          
              // Use the updateArrayItem function to get the updated JSON
              const updatedJson = updateArrayItem(prevJson, keys, index, newValue);
              return updatedJson; // Return the updated JSON structure
            });
          };
          
    
        return Object.keys(data).map((key, index) => {
          const value = data[key];
          const fieldKey = `${parentKey}.${key}`;
          const isValueArray = Array.isArray(value);
    
          if (typeof value === 'object' && value !== null) {
            if (isValueArray) {
              // Enhanced array handling
              return (
                <div key={fieldKey} style={{ marginLeft: '20px' }}>
                  <EditableKey
                    originalKey={key}
                    parentKey={parentKey}
                    onKeyChange={handleKeyChanges}
                  />:
                  <div style={{ marginLeft: '20px' }}>
                    {value.map((item, idx) => {
                      if (typeof item !== 'object') {
                        // Editable primitive item
                        return (
                          <EditablePrimitiveArrayItem
                            key={`${fieldKey}.${idx}`}
                            value={item}
                            index={idx}
                            parentKey={fieldKey}
                            onChange={handleArrayItemChange}
                          />
                        );
                      } else {
                        // Nested object or array
                        return (
                          <RenderJsonFields
                            key={`${fieldKey}.${idx}`}
                            data={item}
                            parentKey={`${fieldKey}.${idx}`}
                            handleFieldChange={handleFieldChange}
                            handleKeyChange={handleKeyChanges}
                          />
                        );
                      }
                    })}
                  </div>
                </div>
              );
            } else {
              // Object handling
              return (
                <div key={fieldKey} style={{ marginLeft: '20px' }}>
                  <EditableKey
                    originalKey={key}
                    parentKey={parentKey}
                    onKeyChange={handleKeyChanges}
                  />
                  :
                  <RenderJsonFields
                    data={value}
                    parentKey={fieldKey}
                    handleFieldChange={handleFieldChange}
                    handleKeyChange={handleKeyChanges}
                  />
                </div>
              );
            }
          } else {
            // Primitive handling
            return (
              <div key={fieldKey} style={{ display: 'block', margin: '5px 0' }}>
                <EditableKey
                  originalKey={key}
                  parentKey={parentKey}
                  onKeyChange={handleKeyChanges}
                />
                :
                <InputField path={fieldKey} value={String(value)} onChange={handleFieldChange} />
              </div>
            );
          }
        });
    }
    
    
    
      
    function EditableKey({ originalKey, parentKey, onKeyChange }) {
        const [isEditable, setIsEditable] = useState(false);
        const [keyValue, setKeyValue] = useState(originalKey);
      
        const handleKeyClick = () => setIsEditable(true);
      
        const handleEditKeyChange = (e) => setKeyValue(e.target.value);
      
        const handleKeyBlur = () => {
          setIsEditable(false);
          if (keyValue !== originalKey) {
            // This is where the top-level handleKeyChange is called
            onKeyChange(parentKey, originalKey, keyValue);
          }
        };
      
        return isEditable ? (
          <input
            type="text"
            value={keyValue}
            onChange={handleEditKeyChange} // Use the renamed handler here
            onBlur={handleKeyBlur}
          />
        ) : (
            <span onClick={handleKeyClick} style={{ fontWeight: 'bold' }}>{originalKey}</span> // Make keys bold

        );
    }
      
      
      

    function InputField({ path, value, onChange }) {
        const [isEditable, setIsEditable] = useState(false);
        const [inputValue, setInputValue] = useState(value);
        const [edited, setEdited] = useState(false); // Track if the input value has been edited

        const handleClick = () => {
            setIsEditable(true); // Enable editing on click
        };

        const handleChange = (event) => {
            setInputValue(event.target.value);
            setEdited(true); // Mark as edited on change
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                setIsEditable(false); // Disable editing mode
                if (edited) {
                    onChange(path, inputValue); // Update JSON if edited
                    setEdited(false); // Reset edited flag
                }
            }
        };

        const handleBlur = () => {
            setIsEditable(false); // Disable editing mode when focus is lost
            if (edited) {
                onChange(path, inputValue); // Update JSON if edited
                setEdited(false); // Reset edited flag
            }
        };

        return (
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onClick={handleClick}
                onBlur={handleBlur}
                readOnly={!isEditable}
                style={{
                    marginLeft: '10px',
                    border: isEditable ? '1px solid' : 'none', // Toggle border based on edit state
                    background: isEditable ? 'white' : 'transparent',
                    fontWeight: isEditable ? 'bold' : 'normal', // Bold text when editable
                    cursor: 'pointer', // Change cursor to indicate the field is interactive
                }}
            />
        );
    }
 
    const handleFieldChange = (path, newValue) => {
        let newData = JSON.parse(JSON.stringify(jsonData)); // Deep clone the current state
        const keys = path.split('.').slice(1); // Remove the first empty element from the path split
        let temp = newData;
    
        keys.forEach((key, index) => {
            if (/\d+/.test(key) && Array.isArray(temp)) { // Check if the key is an index of an array
                key = parseInt(key); // Convert key to integer for array access
            }
    
            if (index === keys.length - 1) {
                temp[key] = newValue;
            } else {
                temp = temp[key];
            }
        });
    
        setJsonData(newData); // Update the state with the new data
    };
    
    
  
    return (
      <div>
        <RenderJsonFields data={jsonData} handleFieldChange={handleFieldChange} />
      </div>
    );
  }
  

export default DisplayComponent;
