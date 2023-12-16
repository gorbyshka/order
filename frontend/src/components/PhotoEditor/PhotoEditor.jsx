import React, { useState } from "react";
import { Stage, Layer, Rect, Transformer, Image } from "react-konva";
import { useImageStage } from "./useImageStage.js";
import Mark from "./Mark";

const PhotoEditor = ({ image, imageDimensions }) => {
    const {
        rectanglesToDraw,
        layerRef,
        trRef,
        selectionRectRef,
        imageRef,
        stageProps,
        saveDataToLocalStorage,
    } = useImageStage(initialRectangles);

    const [rectangles, setRectangles] = useState(() => {
        const storedRectangles = JSON.parse(localStorage.getItem("rectangles")) || [];
        return [...initialRectangles, ...storedRectangles];
    });
    
       
    const initialX = (window.innerWidth * 0.82 - imageDimensions.width) / 2;
    const initialY = (window.innerHeight - imageDimensions.height) / 2;

    return (
        <>
            <div>
                <div>
                    <button onClick={saveDataToLocalStorage}>Save</button>
                   
                                          
                </div>

                <Stage
                    {...stageProps}
                    width={window.innerWidth * 0.82}
                    height={window.innerHeight}
                >
                    <Layer ref={layerRef}>
                        <Image
                            {...imageDimensions}
                            ref={imageRef}
                            image={image}
                            x={initialX}
                            y={initialY}
                        />

                        {rectanglesToDraw.map((rect, i) => {
                            return (
                                <Mark
                                    imageRef={imageRef}
                                    key={i}
                                    getKey={i}
                                    shapeProps={rect}
                                    onChange={(newAttrs) => {
                                        const rects = rectangles.slice();
                                        rects[i] = newAttrs;
                                        setRectangles(rects);
                                    }}
                                />
                            );
                        })}

                        <Transformer
                            ref={trRef}
                            rotateEnabled={false}
                            anchorSize={10}
                            borderEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                                console.log(1)
                                if (newBox.width < 5 || newBox.height < 5) {

                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />
                        <Rect fill="rgba(0,0,255,0.2)" ref={selectionRectRef} />
                    </Layer>
                </Stage>
            </div>
        </>);
};

const initialRectangles = [
    {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        fill: "rgba(255, 0,0,.2)",
        stroke: "red",
        id: "rect1",
    },
    {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: "rgba(0, 255,0,.2)",
        stroke: "green",
        id: "rect2",
    },
];

export default PhotoEditor;
