import React, {useState} from 'react';
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload.js";
import {styled} from "@mui/material/styles";
import useImage from "use-image";
import PhotoEditor from "./components/PhotoEditor/PhotoEditor.jsx";
import {Box, Container} from "@mui/material";

const App = () => {
    const [imageFile, setImageFile] = useState(null)
    const [imageUrl, setImageUrl] = useState("https://source.unsplash.com/random/300x300?sky")
    const [imageDimensions, setImageDimensions] = useState({width: 0, height: 0});
    const [image] = useImage(imageUrl);
    
    const handleChangeImage = e => {
        const file = e.target.files[0]
        setImageFile(file)
        setImageUrl(URL.createObjectURL(file))

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;

                img.onload = () => {
                    // Get the width and height of the image
                    let width, height
                    const imageWidth = img.width;
                    const imageHeight = img.height;

                    const stageHeight = window.innerHeight
                    const stageWidth = window.innerWidth * 0.82
                    if (imageWidth >= imageHeight) {

                        width = stageWidth
                        height = (imageHeight * width) / imageWidth
                    } else {
                        height = stageHeight
                        width = (imageWidth * height) / imageHeight
                    }
                    setImageDimensions({width, height});
                    console.log({width, height})
                };
            };

            reader.readAsDataURL(file);
        } 
    }

    return (
        <Box sx={{display: 'flex', height: '100vh', width: '100vw'}}>
            <Box sx={{
                width: '18%',
                height: '100%', background: 'gray'
            }}>
                <Button component="label" variant="contained" startIcon={<CloudUploadIcon/>}>
                    Upload file
                    <VisuallyHiddenInput onChange={handleChangeImage} type="file"/>
                </Button>
            </Box>

            <PhotoEditor imageDimensions={imageDimensions} image={image}/>
        </Box>
    );
};
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
export default App;
