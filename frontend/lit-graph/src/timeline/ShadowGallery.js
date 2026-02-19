import { useEffect, useState, useRef } from "react";
import shadowNeoclassical from "../assets/neoclassical.jpeg";
import shadowRomantic from "../assets/romanticism.jpg";
import shadowVictorian from "../assets/victorian.jpg";
import shadowModernist from "../assets/modern.jpg";
import shadowPostmodern from "../assets/postmodern.jpg";

const shadowImages = {
  neoclassical: { 
    src: shadowNeoclassical, 
    caption: "The Progress of Love: The Pursuit, 1771", 
    subtitle: "Jean-Honoré Fragonard" 
  },
  romantic: { 
    src: shadowRomantic, 
    caption: "The Morning, 1808", 
    subtitle: "Philipp Otto Runge" 
  },
  victorian: { 
    src: shadowVictorian, 
    caption: "Sketching from Nature, 1857", 
    subtitle: "Stanley Baldwin" 
  },
  modern: { 
    src: shadowModernist, 
    caption: "Girl on a Pillow, 1936", 
    subtitle: "Pablo Picasso" 
  },
  postmodern: { 
    src: shadowPostmodern, 
    caption: "Water Bearer, 1981", 
    subtitle: "Sandro Chia" 
  },
};

export function ShadowGallery({ eraId, isLeft, parentRef }) {
  const [parallaxY, setParallaxY] = useState(0);
  const [visibility, setVisibility] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef || !parentRef.current) return;
      
      const rect = parentRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const screenCenter = vh / 2;
      const distance = Math.abs(center - screenCenter);
      const maxDistance = vh * 0.55;
      const vis = Math.max(0, 1 - distance / maxDistance);
      setVisibility(vis);
      
      const scrollFactor = (screenCenter - center) * 0.12;
      setParallaxY(scrollFactor);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parentRef]);

  const shadow = shadowImages[eraId];
  if (!shadow) return null;

  const opacity = visibility * 0.22; // max ~22% for ghostly but visible

  // Era-specific colors (matching your theme)
  const eraColorVars = {
    neoclassical: "145, 25%, 35%",
    romantic: "340, 45%, 55%",
    victorian: "35, 35%, 50%",
    modern: "210, 40%, 50%",
    postmodern: "280, 40%, 55%",
  };

  const eraColor = eraColorVars[eraId] || eraColorVars.neoclassical;

  return (
    <div
      ref={imgRef}
      className="shadow-gallery"
      style={{
        [isLeft ? "right" : "left"]: "1%",
        transform: `translateY(calc(-50% + ${parallaxY}px))`,
        opacity,
      }}
    >
      {/* Decorative frame */}
      <div
        className="shadow-frame"
        style={{
          border: `1px solid hsl(${eraColor} / 0.3)`,
          boxShadow: `0 0 40px -10px hsl(${eraColor} / 0.2)`,
          background: `linear-gradient(135deg, hsl(${eraColor} / 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)`,
        }}
      >
        <img
          src={shadow.src}
          alt={shadow.caption}
          className="shadow-image"
          loading="lazy"
        />
      </div>

      {/* Caption */}
      <div
        className="shadow-caption"
        style={{ opacity: visibility > 0.15 ? 1 : 0 }}
      >
        <p className="shadow-caption-title">{shadow.caption}</p>
        <p className="shadow-caption-subtitle">{shadow.subtitle}</p>
      </div>
    </div>
  );
}