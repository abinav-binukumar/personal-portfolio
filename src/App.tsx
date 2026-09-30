import React from 'react';
import styled from 'styled-components';
import { HashRouter as Router } from 'react-router-dom';

// @ts-ignore
import Header from './components/header/header.tsx';
// @ts-ignore
import Hero from './components/hero/hero.tsx';
// @ts-ignore
import Resume from './components/resume/resume.tsx';
// @ts-ignore
import Projects from './components/projects/projects.tsx';
// @ts-ignore
import About from './components/about/about.tsx';
// @ts-ignore
import Footer from './components/footer/footer.tsx';
// @ts-ignore
import Techstack from './components/techstack/techstack.tsx';
import { pixel } from './styles/retro';

const AppContainer = styled.div`
  background-color: ${pixel.bg}; /* Match the background color of the hero section */
  min-height: 100vh;
  padding-bottom: 20px;
  /* No top padding: Header is position:sticky/top:0, so any padding here
     would leave a gap of this near-black background exposed above it at
     the very top of the page, with no border to explain it - reads as a
     rendering glitch rather than intentional spacing. */
`;

const MainContent = styled.div`
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Header />
        <MainContent>
          <Hero />
          
          <About />
          
          <Resume />
          
          <Projects />
          
          <Techstack />
        </MainContent>
        <Footer />
      </AppContainer>
    </Router>
  );
}

export default App;
