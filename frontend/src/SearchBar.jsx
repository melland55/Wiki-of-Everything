import React, { useState } from 'react';
import { Form, FormControl, ListGroup } from 'react-bootstrap';

const SearchBar = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  
  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div style={{ position: 'relative' }}>
      <Form onClick={() => setIsClicked(true)}>
        <FormControl
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onClick={() => setIsClicked(true)}
          onBlur={() => setIsClicked(false)}
        />
      </Form>
      {isClicked && searchTerm.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 999,
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          width: '100%',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <ListGroup>
            {filteredItems.map((item, index) => (
              <ListGroup.Item key={index}>{item}</ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
