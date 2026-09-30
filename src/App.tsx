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
  padding: 20px 0;
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
