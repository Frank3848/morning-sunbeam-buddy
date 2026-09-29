import { Composition } from "remotion";
import { TutorialVideo } from "./TutorialVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={TutorialVideo}
      durationInFrames={1046}
      fps={30}
      width={720}
      height={1280}
    />
  </>
);
