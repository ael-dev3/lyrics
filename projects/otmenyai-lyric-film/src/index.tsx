import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {LayoutAudit} from './LayoutAudit';
const Root=()=> <><Composition id="Otmenyai" component={Film} width={1920} height={1080} fps={60} durationInFrames={7827}/><Composition id="LayoutAudit" component={LayoutAudit} width={1920} height={1080} fps={60} durationInFrames={42}/></>;
registerRoot(Root);
