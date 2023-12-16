// useImageStage.js

import { useEffect, useRef, useState } from "react";

export function useImageStage(initialRectangles) {
    const [stage, setStage] = useState({
        scale: 1,
        x: 0,
        y: 0,
    });

    const [newRectangle, setNewRectangle] = useState([]);

    const [rectangles, setRectangles] = useState([]);
    const rectanglesToDraw = [...rectangles, ...newRectangle];
    const [selectedIds, selectShapes] = useState([]);
    const trRef = useRef();
    const selectionRectRef = useRef();
    const selection = useRef({
        visible: false,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
    });
    const layerRef = useRef();
    const stageRef = useRef();
    const imageRef = useRef();

    const [imageUrl, setImageUrl] = useState("https://source.unsplash.com/random/300x300?sky");

    const [saveClicked, setSaveClicked] = useState(false);

    const saveRectanglesToLocalStorage = (rectangles) => {
        localStorage.setItem("tempRectangles", JSON.stringify(rectangles));
    };

    const saveDataToLocalStorage = () => {
        console.log("Save button clicked");
        const currentRectangles = rectanglesToDraw;

        saveRectanglesToLocalStorage(currentRectangles);

        setSaveClicked(true);
    };

    useEffect(() => {
        const storedRectangles = JSON.parse(localStorage.getItem("rectangles")) || [];
        setRectangles((prevRectangles) => [...prevRectangles, ...storedRectangles]);
    }, []);

    useEffect(() => {
        if (saveClicked) {
            const storedRectangles = JSON.parse(localStorage.getItem("tempRectangles")) || [];
            setRectangles((prevRectangles) => {
                const updatedRectangles = [...prevRectangles, ...storedRectangles];
                setSaveClicked(false);

                localStorage.setItem("rectangles", JSON.stringify(updatedRectangles));

                return updatedRectangles;
            });

            localStorage.setItem("tempRectangles", JSON.stringify([]));
        }
    }, [saveClicked, rectanglesToDraw]);

    const isWithinImageBounds = (x, y) => {
        const imageRect = imageRef.current.getClientRect();
        return (
            x >= imageRect.x &&
            x <= imageRect.x + imageRect.width &&
            y >= imageRect.y &&
            y <= imageRect.y + imageRect.height
        );
    };



    const calculateRelativePosition = (coordinate, scale) => coordinate / scale;
    const calculateRelativeSize = (size, scale) => size / scale;

    const handleMouseDown = (event) => {
        if (isRectangle(event) || isTransformer(event)) return;
      
        const { x, y } = event.target.getStage().getPointerPosition();
      
        if (isWithinImageBounds(x, y)) {
          setNewRectangle([
            {
              x: calculateRelativePosition(x - stage.x, stage.scale),
              y: calculateRelativePosition(y - stage.y, stage.scale),
              width: 1 / stage.scale,
              height: 1 / stage.scale,
              key: Date.now().toString(),
              id: Date.now().toString(),
              fill: "rgba(0, 255,0,.2)",
              stroke: 'green',
            },
          ]);
        }
      };
      
      const handleMouseMove = (event) => {
        if (newRectangle.length === 1) {
          const { x, y } = event.target.getStage().getPointerPosition();
          const updatedRect = { ...newRectangle[0] };
      
          updatedRect.width = calculateRelativeSize(x - stage.x, stage.scale) - updatedRect.x;
          updatedRect.height = calculateRelativeSize(y - stage.y, stage.scale) - updatedRect.y;
      
          setNewRectangle([updatedRect]);
        }
      };
      
      const handleMouseUp = () => {
        if (newRectangle.length === 1) {
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles, newRectangle[0]];
            saveRectanglesToLocalStorage(updatedRectangles);
            return updatedRectangles;
          });
      
          setNewRectangle([]);
        }
      };
      
      
    const handleWheel = (e) => {
        e.evt.preventDefault();

        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        setStage({
            scale: newScale,
            x: (stage.getPointerPosition().x / newScale - mousePointTo.x) * newScale,
            y: (stage.getPointerPosition().y / newScale - mousePointTo.y) * newScale,
        });
    };

    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShapes([]);
        }
    };

    const onClickTap = (e) => {
        const { x1, x2, y1, y2 } = selection.current;
        const moved = x1 !== x2 || y1 !== y2;
        if (moved) {
            return;
        }
        let stage = e.target.getStage();
        let layer = layerRef.current;
        let tr = trRef.current;

        if (e.target === stage) {
            selectShapes([]);
            return;
        }

        if (!e.target.hasName("rectangle")) {
            return;
        }

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = tr.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
            selectShapes([e.target.id()]);
        } else if (metaPressed && isSelected) {
            selectShapes((oldShapes) => {
                return oldShapes.filter((oldId) => oldId !== e.target.id());
            });
        } else if (metaPressed && !isSelected) {
            selectShapes((oldShapes) => {
                return [...oldShapes, e.target.id()];
            });
        }
        layer.draw();
    };

    useEffect(() => {
        const nodes = selectedIds.map((id) => layerRef.current.findOne("#" + id));
        trRef.current.nodes(nodes);
    }, [selectedIds]);

    const handleChangeImage = (newImageUrl) => {
        setImageUrl(newImageUrl);
    };

    return {
        rectangles,
        imageUrl,
        saveDataToLocalStorage,
        handleChangeImage,
        rectanglesToDraw,
        layerRef,
        trRef,
        selectionRectRef,
        setRectangles,
        imageRef,
        stageProps: {
            ref: stageRef,
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onTouchStart: checkDeselect,
            onClick: onClickTap,
            onWheel: handleWheel,
            scaleX: stage.scale,
            scaleY: stage.scale,
            x: stage.x,
            y: stage.y,
        },
    };
}

const isRectangle = (e) => {
    return e.target.hasName("rectangle");
};
const isTransformer = (e) => {
    return e.target.findAncestor("Transformer");
};
