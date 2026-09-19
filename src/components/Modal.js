(function(){
// ─── Modal ───
const S = window.S;
window.Modal = function Modal({
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: S.overlay,
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.modal
  }, children));
};
})();
