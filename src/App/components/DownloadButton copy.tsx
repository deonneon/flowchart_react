import {
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { toPng } from "html-to-image";
import { Button } from "@mui/material";

function downloadImage(dataUrl: string) {
  const a = document.createElement("a");

  a.setAttribute("download", "reactflow.png");
  a.setAttribute("href", dataUrl);
  a.click();
}

const imageWidth: number = 1024 * 2;
const imageHeight: number = 768 * 2;

function DownloadButton(): JSX.Element {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    const viewport = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;
    if (!viewport) return;

    toPng(viewport, {
      backgroundColor: "white",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      } as Partial<CSSStyleDeclaration>, // Use Partial<CSSStyleDeclaration> directly
    }).then(downloadImage);
  };

  return (
    <Button variant="outlined" style={{ width: "200px" }} onClick={onClick}>
      Export as Image
    </Button>
  );
}

export default DownloadButton;
