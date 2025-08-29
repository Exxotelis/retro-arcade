import useInput from "../hooks/useInput";
import MobileControls from "../components/MobileControls";
import useIsTouch from "../hooks/useIsTouch";
import PongMini from "./PongMini.jsx";

export default function PongModal({ open, onClose }) {
  const { state, setPressed, swipeHandlers } = useInput();
  const isTouch = useIsTouch();
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="container" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <strong>Pong (Local)</strong>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body" style={{ position:"relative", padding:"16px 12px 24px" }}>
          {/* swipe joystick layer μόνο σε touch */}
          {isTouch && <div className="touch-layer" {...swipeHandlers} />}

          {/* περνάμε το state στο component */}
          <PongMini title="Pong" onExit={onClose} externalState={state} />

          {/* on-screen controls μόνο σε touch */}
          <MobileControls visible={isTouch} onPress={setPressed} />
        </div>
      </div>
    </div>
  );
}
