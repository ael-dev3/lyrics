import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {LayoutAudit} from './LayoutAudit';
const Root=()=> <><Composition id="RoiAdore" component={Film} width={1920} height={1080} fps={60} durationInFrames={22763}/><Composition id="RoiAdoreDynamic" component={Film} width={1920} height={1080} fps={60} durationInFrames={22763} defaultProps={{externalArtwork:true,layer:'dynamic'}}/><Composition id="RoiAdoreStatic" component={Film} width={1920} height={1080} fps={60} durationInFrames={1} defaultProps={{externalArtwork:true,layer:'static'}}/><Composition id="LayoutAudit" component={LayoutAudit} width={1920} height={1080} fps={60} durationInFrames={142}/></>;
registerRoot(Root);
