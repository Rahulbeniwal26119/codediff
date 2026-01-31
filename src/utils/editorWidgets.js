

export const createOverlayToolbar = (editor, id, buttons) => {
    return {
        domNode: null,
        getId: function () { return id; },
        getDomNode: function () {
            if (!this.domNode) {
                this.domNode = document.createElement('div');
                this.domNode.className = 'monaco-overlay-widget';
                this.domNode.style.cssText = `
                    display: flex;
                    gap: 8px;
                    padding: 8px;
                    z-index: 100;
                    flex-wrap: wrap;
                    max-width: 100%;
                `;

                buttons.forEach(btn => {
                    const button = document.createElement('button');

                    // Material 3 styling with proper colors


                    button.className = 'editor-action-button';
                    button.style.cssText = `
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 8px 16px;
                        border-radius: 16px;
                        font-size: 13px;
                        font-weight: 600;
                        font-family: 'Inter', sans-serif;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        transform-origin: center;
                        ${btn.color === 'purple' ? 'background: #7c3aed; color: white;' : ''}
                        ${btn.color === 'emerald' ? 'background: #059669; color: white;' : ''}
                        ${btn.color === 'sky' ? 'background: #0284c7; color: white;' : ''}
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    `;

                    // Icon + Label
                    button.innerHTML = `
                        <span style="font-size: 14px; line-height: 1;">${btn.icon || ''}</span>
                        <span style="line-height: 1;">${btn.label}</span>
                    `;

                    // Hover effects
                    button.onmouseenter = () => {
                        button.style.transform = 'scale(1.05) translateY(-1px)';
                        if (btn.color === 'purple') button.style.background = '#6d28d9';
                        if (btn.color === 'emerald') button.style.background = '#047857';
                        if (btn.color === 'sky') button.style.background = '#0369a1';
                        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    };

                    button.onmouseleave = () => {
                        button.style.transform = 'scale(1) translateY(0)';
                        if (btn.color === 'purple') button.style.background = '#7c3aed';
                        if (btn.color === 'emerald') button.style.background = '#059669';
                        if (btn.color === 'sky') button.style.background = '#0284c7';
                        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    };

                    button.onmousedown = () => {
                        button.style.transform = 'scale(0.95)';
                    };

                    button.onmouseup = () => {
                        button.style.transform = 'scale(1.05) translateY(-1px)';
                    };

                    button.onclick = (e) => {
                        e.stopPropagation();

                        // Ripple effect
                        const ripple = document.createElement('span');
                        ripple.style.cssText = `
                            position: absolute;
                            border-radius: 50%;
                            background: rgba(255, 255, 255, 0.6);
                            width: 100px;
                            height: 100px;
                            margin-top: -50px;
                            margin-left: -50px;
                            animation: ripple 0.6s;
                            pointer-events: none;
                        `;
                        button.style.position = 'relative';
                        button.style.overflow = 'hidden';

                        const rect = button.getBoundingClientRect();
                        ripple.style.left = e.clientX - rect.left + 'px';
                        ripple.style.top = e.clientY - rect.top + 'px';

                        button.appendChild(ripple);
                        setTimeout(() => ripple.remove(), 600);

                        btn.onClick();
                    };

                    this.domNode.appendChild(button);
                });

                // Add ripple animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes ripple {
                        0% {
                            transform: scale(0);
                            opacity: 1;
                        }
                        100% {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
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
