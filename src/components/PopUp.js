import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { FaArrowsAlt } from 'react-icons/fa'; // Importa un ícono de flechas para el botón
import { IoClose } from 'react-icons/io5'
import { Button } from 'react-bootstrap';

const PopUp = ({ onClose, content}) => {
  const [width, setWidth] = useState(640); // Ancho inicial
  const [height, setHeight] = useState(480); // Alto inicial
  const [activeDrags, setActiveDrags] = useState(0);
  const [dragEnabled, setDragEnabled] = useState(false);

  const handleResize = (e, { size }) => {
    setWidth(size.width);
    setHeight(size.height);
  };

  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };

  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };

  const toggleDrag = () => {
    setDragEnabled(!dragEnabled);
    if (dragEnabled) {
      // Habilitar el renderizado de Cesium
      //viewer.scene.requestRenderMode = false;
    } else {
      // Deshabilitar el renderizado de Cesium
      //viewer.scene.requestRenderMode = true; // Establece un valor adecuado
    }
  };
  

  const popupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '9999',
    padding: '10px',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer',
  };
  const dragButtonStyle = {
    position: 'absolute',
    top: 0, 
    left: 0,
    cursor: 'pointer',
  };
  
  //const videoUrl = 'http://90.94.181.205:8080/axis-cgi/mjpg/video.cgi';
  const videoUrl = 'https://video.abbahoteles.com/hls/burgos/master.m3u8'
      
  return (
    <Draggable
      handle={dragEnabled ? '.handle' : '.drag-button'} // Cambia el manejador según dragEnabled
      onStart={onStart}
      onStop={onStop}
      cancel=".input, .textarea"
      cursor={dragEnabled ? 'move' : 'default'} // Cambia el cursor según dragEnabled
    >
      <div style={popupStyle} className="handle">
        <Button
          className="drag-button"
          variant="primary"
          style={dragButtonStyle}
          onMouseDown={toggleDrag}
        >
          <FaArrowsAlt />
        </Button>

        <Button
          className="close-button"
          variant="primary"
          style={closeButtonStyle}
          onClick={onClose}
        >
          <IoClose />
        </Button>
        
        {content}
        {/*<iframe width="640" height="480" src={videoUrl}></iframe>  Utiliza llaves para interpolar la URL */}
      
      </div>
    </Draggable>
  );
};

export default PopUp;
