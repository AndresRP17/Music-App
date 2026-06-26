import { useEffect, useRef } from "react";
import "./styles/ModalBienvenida.css";

function ModalPremiumBienvenida({ onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = ["#d0b412", "#f0d060", "#ffffff", "#ffa500", "#fffaaa", "#ffdd00"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2.5 + 1,
      drift: (Math.random() - 0.5) * 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.18,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        }
        ctx.restore();
        p.y += p.speed;
        p.x += p.drift;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="modal-premium-overlay">
      <canvas ref={canvasRef} className="modal-premium-canvas" />
      <div className="modal-premium-box">
        <div className="modal-premium-crown">👑</div>
        <h2 className="modal-premium-titulo">¡Bienvenido a Premium!</h2>
        <p className="modal-premium-sub">Ya sos parte de la comunidad.</p>

        <div className="modal-premium-features">
          {[
            { icon: "🚫", titulo: "Sin anuncios", desc: "Experiencia limpia, sin interrupciones" },
            { icon: "⭐", titulo: "Favoritos ilimitados", desc: "Guardá todas las canciones que quieras" },
            { icon: "🎵", titulo: "Playlists personalizadas", desc: "Creá y gestioná tus propias listas" },
            { icon: "✨", titulo: "Modo dorado", desc: "La app se viste de oro para vos" },
          ].map((f) => (
            <div key={f.titulo} className="modal-premium-feature-item">
              <span className="modal-premium-feature-icon">{f.icon}</span>
              <div>
                <div className="modal-premium-feature-titulo">{f.titulo}</div>
                <div className="modal-premium-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="modal-premium-btn1" onClick={onClose}>
          ¡Empezar a disfrutar!
        </button>
      </div>
    </div>
  );
}

export default ModalPremiumBienvenida;