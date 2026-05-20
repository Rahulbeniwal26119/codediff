const getButtonTheme = (color) => {
    const themes = {
        purple: {
            accent: '#ff8a1f',
            hoverAccent: '#ff9f42',
            glow: 'rgba(255, 122, 26, 0.22)',
        },
        emerald: {
            accent: '#44d38a',
            hoverAccent: '#63e2a0',
            glow: 'rgba(68, 211, 138, 0.18)',
        },
        sky: {
            accent: '#44d38a',
            hoverAccent: '#63e2a0',
            glow: 'rgba(68, 211, 138, 0.18)',
        },
    };

    return themes[color] || themes.purple;
};

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
                    align-items: center;
                    gap: 4px;
                    padding: 4px;
                    margin: 8px 10px 0 0;
                    z-index: 100;
                    max-width: calc(100% - 20px);
                    border: 1px solid rgba(255, 122, 26, 0.18);
                    border-radius: 12px;
                    background: rgba(12, 10, 8, 0.88);
                    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(14px);
                `;

                buttons.forEach(btn => {
                    const button = document.createElement('button');
                    const theme = getButtonTheme(btn.color);

                    button.className = 'editor-action-button';
                    button.type = 'button';
                    button.setAttribute('aria-label', btn.label);
                    button.style.cssText = `
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 7px;
                        height: 28px;
                        padding: 0 10px;
                        border-radius: 8px;
                        font-size: 12px;
                        font-weight: 700;
                        font-family: 'Inter', sans-serif;
                        letter-spacing: 0;
                        color: #fff6ed;
                        border: 1px solid rgba(255, 255, 255, 0.07);
                        background: rgba(255, 255, 255, 0.045);
                        cursor: pointer;
                        transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
                        transform-origin: center;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
                    `;

                    const dot = document.createElement('span');
                    dot.setAttribute('aria-hidden', 'true');
                    dot.style.cssText = `
                        width: 6px;
                        height: 6px;
                        border-radius: 999px;
                        background: ${theme.accent};
                        box-shadow: 0 0 12px ${theme.glow};
                        flex: 0 0 auto;
                    `;

                    const label = document.createElement('span');
                    label.textContent = btn.label;
                    label.style.cssText = `
                        line-height: 1;
                        white-space: nowrap;
                    `;

                    button.appendChild(dot);
                    button.appendChild(label);

                    button.onmouseenter = () => {
                        button.style.transform = 'translateY(-1px)';
                        button.style.background = 'rgba(255, 255, 255, 0.075)';
                        button.style.borderColor = theme.accent;
                        button.style.boxShadow = `0 8px 22px rgba(0, 0, 0, 0.28), 0 0 0 1px ${theme.glow}`;
                        dot.style.background = theme.hoverAccent;
                    };

                    button.onmouseleave = () => {
                        button.style.transform = 'translateY(0)';
                        button.style.background = 'rgba(255, 255, 255, 0.045)';
                        button.style.borderColor = 'rgba(255, 255, 255, 0.07)';
                        button.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.04)';
                        dot.style.background = theme.accent;
                    };

                    button.onmousedown = () => {
                        button.style.transform = 'translateY(0) scale(0.98)';
                    };

                    button.onmouseup = () => {
                        button.style.transform = 'translateY(-1px)';
                    };

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
