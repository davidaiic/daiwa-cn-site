export function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,.82)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1',
    zIndex: 1000,
    boxShadow: '0 4px 14px rgba(0,0,0,.25)',
    pointerEvents: 'none'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}
