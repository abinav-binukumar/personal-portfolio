import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import RepelText from './RepelText';
import HeroGame from './HeroGame';
import ShipPanel from './ShipPanel';
import { pixel, fontPixelDisplay } from '../../styles/retro';

// Main container for the hero section.
// The header above this is sticky (occupies real space, doesn't overlay), and
// AppContainer (App.tsx) adds 20px of padding above it too - so a naive
// `100vh` here makes the total page taller than the viewport by both of
// those, which is exactly why the ship/game sprite (anchored near the bottom
// of this section) was ending up below the fold. --header-height is measured
// and set by header.tsx; 84px is just a first-paint fallback.
const APP_CONTAINER_TOP_PADDING = '20px';
const HeroContainer = styled.section`
  display: flex;
  flex-direction: column; /* Stack items vertically by default */
  min-height: calc(100vh - var(--header-height, 84px) - ${APP_CONTAINER_TOP_PADDING});
  background-color: ${pixel.bg}; /* Dark arcade background */
  color: #fff; /* White text */
  overflow: hidden; /* Prevent overflow */
  font-family: 'RobotoMono', sans-serif; /* Use RobotoMono font */

  @media (max-width: 768px) {
    /* Fit within one screen so the ship/game isn't pushed below the fold -
       was min-height, which let the text block and the game each
       independently demand half the screen. */
    height: calc(100vh - var(--header-height, 61px) - ${APP_CONTAINER_TOP_PADDING});
    overflow-y: auto;
  }

  @media (min-width: 768px) {
    flex-direction: row; /* On larger screens, layout side by side */
  }
`;

// Left container for text and main title
const LeftContainer = styled.div`
  flex: 1; /* Take up equal space */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center text vertically */
  padding: 40px; /* Padding around the text */
  text-align: left; /* Left-align the text */
  margin-top: -10%; /* Adjust to move text slightly up */

  @media (max-width: 768px) {
    flex: 0 0 auto; /* Size to its own content instead of claiming half the screen */
    padding: 16px 20px 8px; /* Compact padding for smaller screens */
    margin-top: 0; /* Remove negative margin for mobile */
  }

  @media (min-width: 768px) {
    flex: 0 0 38%; /* Take up space on larger screens - a bit more than a third, so the title has room */
  }
`;

// Right container: hosts the flip card (ship logo <-> asteroids game).
// This is the scroll-anchor target for the header's "Contact" link - it must
// stay a plain, untransformed element so scrollIntoView lands correctly
// (the inner flip faces are rotated in 3D and are an unreliable scroll target).
const RightContainer = styled.div`
  flex: 1; /* Take up equal space */
  position: relative;
  overflow: hidden; /* Prevent overflow of elements */
  min-height: 50vh; /* Minimum height for smaller screens */

  @media (max-width: 768px) {
    flex: 1 1 auto; /* Fill whatever room LeftContainer doesn't need */
    min-height: 280px; /* Modest floor instead of forcing half the screen */
  }

  @media (min-width: 768px) {
    flex: 0 0 62%; /* Take up the rest of the space on larger screens */
  }
`;

// Perspective wrapper for the flip animation
const FlipContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 50vh;
  position: relative;
  perspective: 1600px;
`;

// The rotating card - swaps between the ship logo and the game
const FlipInner = styled.div<{ $flipped: boolean }>`
  width: 100%;
  height: 100%;
  min-height: 50vh;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.15, 0.2, 1);
  transform: rotateY(${({ $flipped }) => ($flipped ? 180 : 0)}deg);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// $hidden is belt-and-suspenders on top of backface-visibility: some browsers
// still let clicks land on a backface-hidden element after a reflow, which
// was swallowing clicks meant for the game's input/buttons underneath.
const FlipFace = styled.div<{ $hidden: boolean }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
`;

const FlipFaceBack = styled(FlipFace)`
  transform: rotateY(180deg);
`;

// Headline above the gradient title - sized explicitly (rather than the
// browser's large default h1 size) so it doesn't eat mobile's limited height
const TopLine = styled.h1`
  font-size: 1.1em;
  line-height: 1.4;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.5em;
  }
`;

// Styling for the title (per-letter color handled by RepelText, since a
// background-clip gradient can't paint through each letter's own transform layer)
const GradientText = styled.h2`
  font-family: ${fontPixelDisplay};
  font-size: 1.8em; /* Large font size (Press Start 2P runs big) */
  line-height: 1.6;
  margin: 0.5em 0; /* Space around the text */

  @media (max-width: 768px) {
    font-size: 1.3em;
  }

  @media (min-width: 768px) {
    font-size: 2em;
  }
`;

// Styling for the typewriter effect text
const TypewriterText = styled.div`
  color: ${pixel.cyan}; /* Neon cyan accent */
  font-size: 1.5em; /* Medium font size */
  margin-top: 0.5em; /* Space above the text */
  white-space: nowrap; /* Prevent text from wrapping */
  overflow: hidden; /* Hide overflowing text */
`;

// Array of possible headline texts
const topLines = [
  "In a galaxy far, far away, I created this portfolio.",
  "Winter is coming, but you're safe here. Explore my work.",
  "Welcome to my corner of the web!",
  "Greetings! I'm thrilled to have you here.",
  "Hi! Thanks for dropping by.",
  "Say hello to my little projects!",
  "Welcome to the dark side of my portfolio.",
];

// Array of texts for the typewriter effect
const typewriterTexts = [
  "Software Developer",
  "Cloud & DevOps Engineer",
  "Full-Stack Builder",
  "Coffee Lover",
  "Hackathon Fanatic"
];

// Main Hero component
const Hero: React.FC = () => {
  const [topLine, setTopLine] = useState(''); // State for random headline
  const [currentText, setCurrentText] = useState(''); // State for typewriter text
  const [flipped, setFlipped] = useState(false); // Whether the game side is showing

  useEffect(() => {
    // Pick a random top line for the header when the component mounts
    setTopLine(topLines[Math.floor(Math.random() * topLines.length)]);
  }, []);

  useEffect(() => {
    // Typewriter effect. This needs a real cleanup: React.StrictMode
    // (index.tsx) deliberately mounts every effect twice in dev to catch
    // exactly this kind of missing teardown - without clearTimeout here,
    // that second mount started a second, never-cancelled type/delete loop
    // racing the first one and stepping on the same currentText state,
    // which is what made the typing/deleting look completely garbled.
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let wordIndex = 0;

    const TYPE_SPEED = 70;
    const DELETE_SPEED = 18; // fast, like holding backspace
    const HOLD_TIME = 1600;

    const startWord = () => {
      const word = typewriterTexts[wordIndex];
      let pos = 0;

      const typeStep = () => {
        if (cancelled) return;
        pos += 1;
        setCurrentText(word.slice(0, pos) + '_');
        timeoutId = setTimeout(pos >= word.length ? deleteStep : typeStep, pos >= word.length ? HOLD_TIME : TYPE_SPEED);
      };

      const deleteStep = () => {
        if (cancelled) return;
        pos -= 1;
        setCurrentText(word.slice(0, Math.max(pos, 0)) + '_');
        if (pos <= 0) {
          wordIndex = (wordIndex + 1) % typewriterTexts.length;
          timeoutId = setTimeout(startWord, TYPE_SPEED);
        } else {
          timeoutId = setTimeout(deleteStep, DELETE_SPEED);
        }
      };

      typeStep();
    };

    startWord();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // The header's "Contact" link scrolls here directly (see header.tsx);
    // this event also flips the card open so the contact form is visible.
    const openGame = () => setFlipped(true);
    window.addEventListener('open-contact-game', openGame);
    return () => window.removeEventListener('open-contact-game', openGame);
  }, []);

  return (
    <HeroContainer id="home">
      <LeftContainer>
        <TopLine>{topLine}</TopLine> {/* Display random headline */}
        <GradientText>
          <RepelText text="Hello" gradient={['#d9a441', '#d9a441']} />
          <br />
          <RepelText text="I'm Abinav." />
        </GradientText>
        <TypewriterText>{currentText}</TypewriterText> {/* Display typewriter effect text */}
      </LeftContainer>
      <RightContainer id="contact">
        <FlipContainer>
          <FlipInner $flipped={flipped}>
            <FlipFace $hidden={flipped}>
              <ShipPanel onActivate={() => setFlipped(true)} active={!flipped} />
            </FlipFace>
            <FlipFaceBack $hidden={!flipped}>
              <HeroGame active={flipped} onExit={() => setFlipped(false)} />
            </FlipFaceBack>
          </FlipInner>
        </FlipContainer>
      </RightContainer>
    </HeroContainer>
  );
};

export default Hero;
