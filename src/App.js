import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images,setImages] = useState([])
  const [buttonDelete,setButtonDelete] = useState(false)
  useEffect(() => {
     getImg();
  }, [])
  
  async function getImg () {
    try {
      fetch('https://jsonplaceholder.typicode.com/photos')
      .then(response => response.json())
      .then(json => setImages(json))
    } catch (error) {
      console.log(error);
    }
  }

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    console.log(Math.floor(Math.random()*(5000-20+1)+20));

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        img:images[Math.floor(Math.random()*(100-20+1)+20)],
        updateEnd: true
      },
    ]);
  };
  const deleteMoveable = () => {
    const newArray = moveableComponents.filter( item => item.id !== selected )
    setMoveableComponents(newArray);
    setButtonDelete(false)
  }
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }} className="main">
      <div className="buttons">
        <button onClick={addMoveable} className="button button-add">Add</button>
        {buttonDelete ? <button onClick={deleteMoveable} className="button button-delete">Delete</button> : ""} 
      </div>
      
      <div
        id="parent"
        className="component_container"
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            setButtonDelete={setButtonDelete}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  img,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  setButtonDelete
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
    img
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
 
  const onResize = async (e) => {
    console.log("onResize");
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      img
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    console.log("OnrisezeEnd");
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: top, // tenia el paremetro de absoluteTop y generaba que el Moveable se saliera del selector
        left: left, // tenia el paremetro de absoluteLeft y generaba que el Moveable se saliera del selector
        width: newWidth,
        height: newHeight,
        color,
        img
      },
      true
    );
  };
  const handledSelected = (id) => {
    setSelected(id);
    setButtonDelete(true)
  }
  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundImage:`url(${img.thumbnailUrl})`,
        }}
        onClick={() => handledSelected(id)}
      > 
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            img
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        bounds={{"left":0,"top":0,"right":0,"bottom":0,"position":"css"}}    // La documentacion indica que las propiedades bound y snappable permiten no salirse del conetenedor parent
        snappable={true}
      />
    </>
  );
};
