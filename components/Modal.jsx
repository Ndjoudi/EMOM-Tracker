// ─── Modal ───
const S = window.S;

window.Modal = function Modal({ children, onClose }) {
  return (
    <div style={S.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={S.modal}>{children}</div>
    </div>
  );
};
