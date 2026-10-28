/* Custom CSS styling & animations for Bartender Game */

body {
    font-family: 'Fredoka', sans-serif;
    user-select: none;
    touch-action: manipulation;
}

.font-outfit {
    font-family: 'Outfit', sans-serif;
}

/* Shaking animation for glass shaker */
@keyframes shakeAnim {
    0% { transform: rotate(0deg) translate(0, 0); }
    20% { transform: rotate(-15deg) translate(-10px, -5px); }
    40% { transform: rotate(15deg) translate(10px, 5px); }
    60% { transform: rotate(-10deg) translate(-5px, -10px); }
    80% { transform: rotate(10deg) translate(5px, 5px); }
    100% { transform: rotate(0deg) translate(0, 0); }
}

.animate-shake {
    animation: shakeAnim 0.3s infinite ease-in-out;
}

/* Glass liquid smooth dynamic transition */
.liquid-layer {
    transition: height 0.4s ease-out, background-color 0.4s ease;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 8px;
}
::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
}
::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
}