export const createOverlayToolbar = (editor, id, buttons) => {
    return {
        domNode: null,
        getId: function () { return id; },
        getDomNode: function () {
            if (!this.domNode) {
                this.domNode = document.createElement('div');
                this.domNode.className = 'monaco-overlay-widget flex gap-2';
                this.domNode.style.zIndex = '100';

                buttons.forEach(btn => {
                    const button = document.createElement('button');
                    button.className = `px-2 py-1 rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1 backdrop-blur-sm bg-opacity-90 ${btn.colorClass}`;
                    button.innerHTML = `<span>${btn.icon || ''}</span> ${btn.label}`;
                    button.style.cursor = 'pointer';
                    button.onclick = (e) => {
                        e.stopPropagation();
                        btn.onClick();
                    };
                    this.domNode.appendChild(button);
                });
            }
            return this.domNode;
        },
        getPosition: function () {
            return {
                preference: 0 // 0 = TOP_RIGHT_CORNER
            };
        }
    };
};
