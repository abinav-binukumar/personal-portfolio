import React from 'react';
import styled from 'styled-components';
import { pixel, fontPixelDisplay, pixelCorners } from '../../styles/retro';
import PixelAvidReaderArt from './PixelAvidReaderArt';

// Importing assets for project GIFs
import niyaGif from '../../assets/projects/Niya.gif';
import lightUpGif from '../../assets/projects/LightUp.gif';
import pongGameGif from '../../assets/projects/PongGame.gif';
import plateProcessorGif from '../../assets/projects/PlateProcessor.gif';
import portfolioGif from '../../assets/projects/Portfolio.gif';

// Main container for all projects, handles layout and styling
const ProjectsContainer = styled.div`
  display: flex;
  flex-direction: column; /* Stack projects vertically */
  align-items: center; /* Center all content horizontally */
  color: #fff; /* White text color */
  font-family: 'RobotoMono', sans-serif;
  padding: 0 10px; /* Padding for horizontal content */
  overflow-x: hidden; /* Prevent horizontal scrolling */
  width: 80%; /* Set container width */
  margin: 0 auto; /* Center the container */
`;

// Title for the projects section
const SectionTitle = styled.h2`
  font-family: ${fontPixelDisplay};
  font-size: 1.4em; /* Press Start 2P runs wide */
  line-height: 1.6;
  margin-bottom: 24px; /* Space below the title */
  text-align: left; /* Align text to the left */
  width: 100%; /* Take up full width of the container */
  box-sizing: border-box; /* Include padding and borders in width calculation */
`;

// Container for big projects, aligns them vertically
const BigProjectsContainer = styled.div`
  display: flex;
  flex-direction: column; /* Stack big projects vertically */
  align-items: center; /* Center content horizontally */
  width: 100%; /* Full width for the big projects container */
`;

// Container for individual projects, handles layout and background styling
const ProjectContainer = styled.div`
  width: 100%; /* Full width for individual projects */
  margin-bottom: 40px; /* Space below each project */
  background: ${pixel.bgCard}; /* Dark arcade card background */
  border: 2px solid ${pixel.purpleDark};
  clip-path: ${pixelCorners(10)};
  padding: 20px; /* Padding around the project content */
  text-align: center; /* Center the text inside the project */
  position: relative; /* Relative positioning for background media */
  overflow: hidden; /* Ensure no content overflows outside the box */
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translate(-3px, -3px);
    border-color: ${pixel.purple};
  }

  /* Style for project images or videos */
  img, video {
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    object-fit: cover; /* Cover the area without distortion */
    position: absolute; /* Position absolutely within the container */
    top: 0;
    left: 0;
    z-index: 0; /* Place the image or video behind text */
    opacity: 0.3; /* Semi-transparent to not overpower the text */
  }

  /* Original stand-in illustration (not a screenshot) for projects with no media yet */
  .avidreader-art {
    display: block;
    margin: 0 auto 14px;
    position: relative;
    z-index: 1;
  }

  /* Style for project titles */
  h3 {
    font-size: 1.6em; /* Large font for project titles */
    margin-bottom: 10px; /* Space below the title */
    z-index: 1; /* Ensure the title is above the background media */
    position: relative; /* Keep relative positioning for z-index */
  }

  /* Style for project description text */
  p {
    font-size: 1.2em; /* Medium size for description */
    margin-bottom: 20px; /* Space below the description */
    z-index: 1; /* Ensure text is above the media */
    position: relative; /* Keep relative positioning */
  }

  /* Style for the links section */
  .links {
    z-index: 1; /* Ensure links are above the background media */
    position: relative; /* Relative positioning for z-index control */
    display: flex; /* Use flexbox for layout */
    justify-content: center; /* Center the links */
    gap: 20px; /* Space between links */
  }

  /* Style for individual links */
  a {
    color: ${pixel.cyan}; /* Neon cyan for links */
    font-size: 1.2em; /* Font size for links */
    display: flex; /* Flex layout for link icon and text */
    align-items: center; /* Center icon and text vertically */
    gap: 8px; /* Space between icon and text */
    text-decoration: none; /* Remove underline from links */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); /* Add text shadow for visibility */

    /* Hover state for links */
    &:hover {
      color: ${pixel.purple}; /* Purple on hover */
    }
  }

  /* Responsive styles for small screens */
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 20px;
    padding: 10px;
  }
`;

// Small "in progress" tag for projects without finished media yet
const InProgressTag = styled.span`
  display: inline-block;
  font-size: 0.6em;
  letter-spacing: 1px;
  color: ${pixel.bg};
  background: ${pixel.cyan};
  padding: 4px 10px;
  margin-bottom: 14px;
  clip-path: ${pixelCorners(3)};
  position: relative;
  z-index: 1;
`;

// Container for small projects, wraps them and spaces them out
const SmallProjectsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow the projects to wrap to new rows */
  justify-content: space-between; /* Space projects out evenly */
  width: 100%; /* Full width for the small projects container */
`;

// Container for individual small projects
const SmallProject = styled.div`
  width: 45%; /* Width for small projects (45% allows 2 per row) */
  margin-bottom: 40px; /* Space below each small project */
  background: ${pixel.bgCard}; /* Dark arcade card background */
  border: 2px solid ${pixel.purpleDark};
  clip-path: ${pixelCorners(8)};
  padding: 20px; /* Padding around the content */
  text-align: center; /* Center text inside the project */
  position: relative; /* Relative positioning for background media */
  overflow: hidden; /* Prevent overflow outside the project box */
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translate(-3px, -3px);
    border-color: ${pixel.purple};
  }

  /* Style for project images or videos */
  img, video {
    width: 100%; /* Full width for media */
    height: 100%; /* Full height for media */
    object-fit: cover; /* Cover the area without distortion */
    position: absolute; /* Position the media absolutely */
    top: 0;
    left: 0;
    z-index: 0; /* Place the media behind the text */
    opacity: 0.3; /* Semi-transparent to not overpower text */
  }

  /* Style for small project titles */
  h3 {
    font-size: 1.3em; /* Smaller font for small project titles */
    margin-bottom: 10px; /* Space below the title */
    z-index: 1; /* Ensure title is above the background media */
    position: relative; /* Keep relative positioning */
  }

  /* Style for small project description text */
  p {
    font-size: 1em; /* Smaller font size for description */
    margin-bottom: 20px; /* Space below the description */
    z-index: 1; /* Ensure text is above the background media */
    position: relative; /* Keep relative positioning */
  }

  /* Style for links in small projects */
  .links {
    z-index: 1; /* Ensure links are above background media */
    position: relative; /* Relative positioning for z-index control */
    display: flex; /* Use flexbox for layout */
    justify-content: center; /* Center the links */
    gap: 20px; /* Space between the links */
  }

  /* Style for individual links */
  a {
    color: ${pixel.cyan}; /* Neon cyan for links */
    font-size: 1em; /* Smaller font size for links */
    display: flex; /* Flex layout for icon and text */
    align-items: center; /* Align icon and text vertically */
    gap: 8px; /* Space between icon and text */
    text-decoration: none; /* Remove underline */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); /* Text shadow for visibility */

    /* Hover state for links */
    &:hover {
      color: ${pixel.purple}; /* Purple on hover */
    }
  }

  /* Responsive styles for different screen sizes */
  @media (max-width: 1250px) {
    width: 45%; /* Maintain two columns on medium screens */
  }

  @media (max-width: 968px) {
    width: 43%; /* Adjust slightly on smaller screens */
  }

  @media (max-width: 768px) {
    width: 100%; /* Full width for small screens */
    margin: 0 auto 20px auto; /* Center and space out projects */
  }
`;

const Projects: React.FC = () => {
  return (
    <ProjectsContainer id="projects">
      <SectionTitle>Projects</SectionTitle>
      <BigProjectsContainer>
        <ProjectContainer>
          <InProgressTag>SCREENSHOTS COMING SOON</InProgressTag>
          <PixelAvidReaderArt className="avidreader-art" />
          <h3>AvidReader - AI-Assisted Reading Dashboard</h3>
          <p>Capstone project: an AI-powered reading platform that lets users interact with documents through grounded Q&amp;A, summaries, quizzes, flashcards, and concept visualization.</p>
        </ProjectContainer>
        <ProjectContainer>
          <img src={niyaGif} alt="niya Hospital Appointment Management System" />
          <h3>niya - Hospital Appointment Management System</h3>
          <p>A hospital appointment management platform (mobile app and admin website) with scheduling, cancellation policies, and patient flow tracking. Built with MongoDB, React Native, and ReactJS.</p>
        </ProjectContainer>
      </BigProjectsContainer>

      <SmallProjectsContainer>
        <SmallProject>
          <img src={lightUpGif} alt="Light Up Puzzle Game" />
          <h3>Light Up Puzzle Game</h3>
          <p>A logic-based puzzle game where players light up all the squares on a grid by placing lamps strategically. The game challenges spatial reasoning and problem-solving skills.</p>
        </SmallProject>
        <SmallProject>
          <img src={pongGameGif} alt="Pong in Assembly Project" />
          <h3>Pong in Assembly</h3>
          <p>This project recreates the classic Pong game using Assembly language in DOSBOX. The game challenges players' reflexes and showcases low-level programming techniques.</p>
        </SmallProject>
        <SmallProject>
          <img src={plateProcessorGif} alt="Vehicle License Plate Processor Project" />
          <h3>Vehicle License Plate Processor</h3>
          <p>This project utilizes computer vision and Python to extract license plates from video feeds, allowing security personnel to efficiently check in vehicles.</p>
        </SmallProject>
        <SmallProject>
          <img src={portfolioGif} alt="Portfolio GIF" />
          <h3>Portfolio</h3>
          <p>Built in React, this portfolio website is designed to showcase my best work and skills. Thanks for checking it out!</p>
        </SmallProject>
      </SmallProjectsContainer>
    </ProjectsContainer>
  );
};

export default Projects;
